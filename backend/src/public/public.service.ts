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
  async getActiveBranches(city?: string) {
    const trimmedCity = city?.trim();
    return this.prisma.branch.findMany({
      where: {
        status: 'ACTIVE',
        ...(trimmedCity ? {
          OR: [
            { branchCity: { equals: trimmedCity, mode: 'insensitive' } },
            { branchCity: { contains: trimmedCity, mode: 'insensitive' } },
            { branchAddress: { contains: trimmedCity, mode: 'insensitive' } },
            { branchName: { contains: trimmedCity, mode: 'insensitive' } },
            { city: { name: { equals: trimmedCity, mode: 'insensitive' } } },
            { city: { state: { equals: trimmedCity, mode: 'insensitive' } } },
          ]
        } : {})
      },
      select: {
        id: true,
        branchCode: true,
        branchName: true,
        branchAddress: true,
        branchCity: true,
        cityId: true,
        workingHours: true,
        phone: true,
        email: true,
        city: {
          select: {
            id: true,
            name: true,
            state: true,
          }
        }
      },
      orderBy: {
        branchName: 'asc'
      }
    });
  }

  // 3b. Get Active Cities
  async getActiveCities() {
    return this.prisma.city.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        state: true,
        country: true,
        branches: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            branchName: true,
            branchCode: true,
            branchCity: true,
            branchAddress: true,
          }
        }
      },
      orderBy: { name: 'asc' }
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
