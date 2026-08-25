import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Get Live Rates
  async getLiveRates() {
    return this.prisma.exchangeRate.findMany({
      where: {
        currency: { isActive: true }
      },
      include: {
        currency: true
      },
      orderBy: {
        currency: { code: 'asc' }
      }
    });
  }

  // 2. Get Active Currencies (currencies that have rates configured)
  async getActiveCurrencies() {
    return this.prisma.currency.findMany({
      where: {
        isActive: true,
        rates: { isNot: null }
      },
      select: {
        id: true,
        code: true,
        name: true,
        symbol: true,
      },
      orderBy: { code: 'asc' }
    });
  }

  // 3. Get Branches
  async getActiveBranches() {
    return this.prisma.branch.findMany({
      select: {
        id: true,
        branchCode: true,
        branchName: true,
        branchAddress: true,
        branchCity: true,
        workingHours: true,
      },
      orderBy: {
        branchCode: 'desc'
      }
    });
  }

  // 4. Get Testimonials
  async getTestimonials() {
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }

  // 5. Get Remittance Transfer Purposes
  async getRemittancePurposes() {
    return this.prisma.transferPurpose.findMany({
      where: { isActive: true },
      include: { documentRequirements: true },
      orderBy: { name: 'asc' },
    });
  }

  // 6. Get Destination Countries for Remittance
  async getRemittanceCountries() {
    return this.prisma.countryConfiguration.findMany({
      where: { isActive: true },
      include: { feeConfigurations: true },
      orderBy: { countryName: 'asc' },
    });
  }

  // 7. Get Forex Products & Status
  async getProducts() {
    return this.prisma.forexProduct.findMany({
      orderBy: { code: 'asc' }
    });
  }
}
