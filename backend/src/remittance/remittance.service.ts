import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RemittanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all orders that have remittance items for the logged-in user.
   */
  async getMyRemittances(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    return this.prisma.order.findMany({
      where: {
        profileId: profile.id,
        items: {
          some: {
            remittance: { isNot: null },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where: { remittance: { isNot: null } },
          include: {
            currency: true,
            product: true,
            remittance: {
              include: { partner: true },
            },
          },
        },
      },
    });
  }

  /**
   * Get a specific remittance order by order ID.
   */
  async getRemittanceById(orderId: string, userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        profileId: profile.id,
        items: { some: { remittance: { isNot: null } } },
      },
      include: {
        branch: true,
        items: {
          where: { remittance: { isNot: null } },
          include: {
            currency: true,
            product: true,
            remittance: {
              include: { partner: true, purpose: true },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Remittance not found');
    return order;
  }

  /**
   * List all active remittance partners (for the new remittance form).
   */
  async getPartners() {
    return this.prisma.remittancePartner.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * List active transfer purposes and document requirements.
   */
  async getPurposes() {
    return this.prisma.transferPurpose.findMany({
      where: { isActive: true },
      include: { documentRequirements: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * List active destination countries and configurations.
   */
  async getCountries() {
    return this.prisma.countryConfiguration.findMany({
      where: { isActive: true },
      include: { feeConfigurations: true },
      orderBy: { countryName: 'asc' },
    });
  }

  /**
   * Estimate transfer rate, fees, and TCS tax.
   */
  async calculate(userId: string, query: { amount: number; currency: string; countryCode: string; purposeCode: string; direction?: string }) {
    const { amount, currency: currencyCode, countryCode, purposeCode, direction = 'RECEIVE' } = query;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const currency = await this.prisma.currency.findUnique({
      where: { code: currencyCode },
      include: { rates: true }
    });

    if (!currency || !currency.rates) {
      throw new BadRequestException(`No active exchange rate for currency ${currencyCode}`);
    }

    const purpose = await this.prisma.transferPurpose.findUnique({
      where: { code: purposeCode }
    });

    if (!purpose) {
      throw new BadRequestException(`Invalid purpose code: ${purposeCode}`);
    }

    const profile = userId ? await this.prisma.customerProfile.findUnique({
      where: { userId }
    }) : null;

    // Load active LRS / spent trackers for TCS calculations
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    
    const lrsTracker = profile ? await this.prisma.lrsLimitTracker.findUnique({
      where: {
        profileId_financialYear: {
          profileId: profile.id,
          financialYear
        }
      }
    }) : null;

    const trackerSpentUsd = lrsTracker 
      ? Number(lrsTracker.declaredAmountUsd || 0) + Number(lrsTracker.systemSpentAmountUsd || 0)
      : 0;
    
    const trackerSpentInr = trackerSpentUsd * 83;

    const activeOrders = profile ? await this.prisma.order.findMany({
      where: {
        profileId: profile.id,
        status: { notIn: ['CANCELLED', 'REJECTED'] }
      }
    }) : [];

    const activeOrdersInr = activeOrders.reduce((sum, o) => sum + Number(o.totalAmountInr || 0), 0);
    const cumulativeSpentInr = trackerSpentInr + activeOrdersInr;

    // Exchange Rate matching standard quote engine wire margin (lockedRate = baseRate * (1 + margin) * 1.01)
    const baseRate = Number(currency.rates.inrRate);
    const margin = Number(currency.rates.marginBuyPct) - 0.002;
    const rate = baseRate * (1 + margin);
    const lockedRate = rate * 1.01;

    let inrSubtotal = 0;
    let foreignAmount = 0;

    if (direction === 'RECEIVE') {
      foreignAmount = amount;
      inrSubtotal = foreignAmount * lockedRate;
    } else {
      inrSubtotal = amount;
      foreignAmount = inrSubtotal / lockedRate;
    }

    // Lookup Fee Bracket
    const feeConfig = await this.prisma.transferFeeConfiguration.findFirst({
      where: {
        country: { countryCode },
        minAmountInr: { lte: inrSubtotal },
        maxAmountInr: { gte: inrSubtotal }
      }
    });

    const feeAmount = feeConfig ? feeConfig.feeAmountInr.toNumber() : 500;

    // Calculate TCS Tax
    const threshold = Number(purpose.tcsThreshold);
    const rateBelow = Number(purpose.tcsRateBelow) / 100;
    const rateAbove = Number(purpose.tcsRateAbove) / 100;

    let tcsAmount = 0;
    if (cumulativeSpentInr >= threshold) {
      tcsAmount = inrSubtotal * rateAbove;
    } else if (cumulativeSpentInr + inrSubtotal <= threshold) {
      tcsAmount = inrSubtotal * rateBelow;
    } else {
      const amountBelow = threshold - cumulativeSpentInr;
      const amountAbove = inrSubtotal - amountBelow;
      tcsAmount = (amountBelow * rateBelow) + (amountAbove * rateAbove);
    }

    const totalInr = inrSubtotal + feeAmount + tcsAmount;

    return {
      exchangeRate: Number(lockedRate.toFixed(4)),
      foreignAmount: Number(foreignAmount.toFixed(2)),
      inrSubtotal: Number(inrSubtotal.toFixed(2)),
      feeAmount: Number(feeAmount.toFixed(2)),
      tcsAmount: Number(tcsAmount.toFixed(2)),
      totalInr: Number(totalInr.toFixed(2)),
      thresholdExceeded: cumulativeSpentInr + inrSubtotal > threshold,
      cumulativeSpentInr,
      purposeCode
    };
  }

  /**
   * Get all beneficiaries for the customer profile.
   */
  async getBeneficiaries(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.beneficiary.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Save a new beneficiary.
   */
  async createBeneficiary(userId: string, data: any) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const { name, bankName, swiftCode, ibanOrAccountNumber, address, country } = data;

    // Prevent duplicate beneficiary creation if clicked twice (idempotency check)
    const existing = await this.prisma.beneficiary.findFirst({
      where: {
        profileId: profile.id,
        ibanOrAccountNumber: ibanOrAccountNumber.trim(),
        swiftCode: swiftCode.trim().toUpperCase(),
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.beneficiary.create({
      data: {
        profileId: profile.id,
        name: name.trim(),
        bankName: bankName.trim(),
        swiftCode: swiftCode.trim().toUpperCase(),
        ibanOrAccountNumber: ibanOrAccountNumber.trim(),
        address: address?.trim() || '',
        country: country?.trim() || '',
      }
    });
  }

  /**
   * Update an existing beneficiary.
   */
  async updateBeneficiary(userId: string, id: string, data: any) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, profileId: profile.id }
    });

    if (!beneficiary) throw new NotFoundException('Beneficiary not found');

    const { name, country, bankName, swiftCode, ibanOrAccountNumber, address, currency } = data;

    return this.prisma.beneficiary.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(country !== undefined && { country: country.trim() }),
        ...(bankName !== undefined && { bankName: bankName.trim() }),
        ...(swiftCode !== undefined && { swiftCode: swiftCode.trim().toUpperCase() }),
        ...(ibanOrAccountNumber !== undefined && { ibanOrAccountNumber: ibanOrAccountNumber.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(currency !== undefined && { currency: currency.trim().toUpperCase() }),
      }
    });
  }

  /**
   * Delete a beneficiary.
   */
  async deleteBeneficiary(userId: string, id: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, profileId: profile.id }
    });

    if (!beneficiary) throw new NotFoundException('Beneficiary not found');

    await this.prisma.beneficiary.delete({
      where: { id }
    });

    return { success: true };
  }
}
