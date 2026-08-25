import { Injectable, Logger, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { FastForexAdapter } from './providers/fastforex.adapter';
import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';

@Injectable()
export class RatesService implements OnModuleInit {
  private readonly logger = new Logger(RatesService.name);

  constructor(
    private prisma: PrismaService,
    private readonly fastForexAdapter: FastForexAdapter,
    private readonly eventBus: DomainEventBus
  ) {}

  async onModuleInit() {
    this.fetchAndSaveRates();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Cron triggered: Fetching live exchange rates from FastForex...');
    await this.fetchAndSaveRates();
  }

  /**
   * The core Pricing Engine method.
   * Gets inter-bank rates from adapter, applies dynamic DB margins, and saves the final customer quote.
   * Uses executeWithReconnect() to automatically recover from Neon serverless idle connection drops.
   */
  async fetchAndSaveRates() {
    try {
      const liveRates = await this.fastForexAdapter.fetchLiveRates();

      // Use executeWithReconnect to handle Neon serverless idle connection drops
      const dbCurrenciesList = await this.prisma.executeWithReconnect(() =>
        this.prisma.currency.findMany({})
      );
      const currencyMap: Record<string, string> = {};
      for (const c of dbCurrenciesList) {
        currencyMap[c.code] = c.id;
      }

      // Fetch dynamic margins from MDM Layer
      const retailMarginRule = await this.prisma.executeWithReconnect(() =>
        this.prisma.exchangeRateMarginRule.findFirst({
          where: { segment: 'RETAIL' }
        })
      );
      const margin = retailMarginRule?.marginPct || 0.01; // Default 1% margin

      const upserts: any[] = [];
      for (const [currencyCode, interbankRateInr] of Object.entries(liveRates)) {
        const currencyId = currencyMap[currencyCode];
        if (!currencyId) continue;

        // Pricing Engine Math:
        // If USD interbank is 83.50, Bank buys for 82.66 (1% less) and sells for 84.33 (1% more)
        const buyRate = +(interbankRateInr * (1 - margin)).toFixed(4);
        const sellRate = +(interbankRateInr * (1 + margin)).toFixed(4);

        upserts.push(
          this.prisma.exchangeRate.upsert({
            where: { currencyId },
            update: {
              inrRate: interbankRateInr,
              marginBuyPct: margin,
              marginSellPct: margin,
            },
            create: {
              currencyId,
              inrRate: interbankRateInr,
              marginBuyPct: margin,
              marginSellPct: margin,
            },
          })
        );
      }

      // Also upsert INR = 1 (Base Currency)
      const inrCurrencyId = currencyMap['INR'];
      if (inrCurrencyId) {
        upserts.push(
          this.prisma.exchangeRate.upsert({
            where: { currencyId: inrCurrencyId },
            update: { inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
            create: { currencyId: inrCurrencyId, inrRate: 1, marginBuyPct: 0, marginSellPct: 0 },
          })
        );
      }

      if (upserts.length === 0) return;

      // Wrap the bulk upsert transaction with executeWithReconnect
      await this.prisma.executeWithReconnect(async () => {
        await this.prisma.$transaction(upserts);
      });

      this.logger.log(`Pricing Engine: Updated ${upserts.length} currency quotes.`);
    } catch (error: any) {
      this.logger.error(`Pricing Engine Failed: \n${error.message}`);
    }
  }

  async getAllRates() {
    return this.prisma.exchangeRate.findMany({
      where: {
        currency: { isActive: true }
      },
      include: { currency: true },
      orderBy: { currency: { code: 'asc' } }
    });
  }

  async addCurrency(data: {
    code: string;
    name: string;
    symbol?: string;
    inrRate: number;
    marginBuyPct?: number;
    marginSellPct?: number;
  }) {
    const code = data.code?.trim().toUpperCase();
    if (!code) throw new BadRequestException('Currency code is required');
    if (!data.name?.trim()) throw new BadRequestException('Currency name is required');
    if (isNaN(Number(data.inrRate)) || Number(data.inrRate) <= 0) {
      throw new BadRequestException('Valid positive INR rate is required');
    }

    const marginBuyPct = data.marginBuyPct !== undefined ? Number(data.marginBuyPct) : 0.01;
    const marginSellPct = data.marginSellPct !== undefined ? Number(data.marginSellPct) : 0.01;
    const inrRate = Number(data.inrRate);
    const symbol = data.symbol?.trim() || code;

    // Check if Currency exists
    let currency = await this.prisma.currency.findUnique({
      where: { code }
    });

    if (currency) {
      currency = await this.prisma.currency.update({
        where: { id: currency.id },
        data: {
          name: data.name.trim(),
          symbol,
          isActive: true
        }
      });
    } else {
      currency = await this.prisma.currency.create({
        data: {
          code,
          name: data.name.trim(),
          symbol,
          isActive: true
        }
      });
    }

    // Upsert ExchangeRate
    const exchangeRate = await this.prisma.exchangeRate.upsert({
      where: { currencyId: currency.id },
      update: {
        inrRate,
        marginBuyPct,
        marginSellPct
      },
      create: {
        currencyId: currency.id,
        inrRate,
        marginBuyPct,
        marginSellPct
      },
      include: { currency: true }
    });

    // Write to history
    await this.prisma.exchangeRateHistory.create({
      data: {
        currencyId: currency.id,
        inrRate
      }
    });

    this.eventBus.publish('LiveRatesUpdated', { currencyCode: code, inrRate, buyMargin: marginBuyPct });

    return exchangeRate;
  }

  async deleteCurrency(idOrCode: string) {
    // Find either by ExchangeRate id, Currency id, or Currency code
    let rate = await this.prisma.exchangeRate.findFirst({
      where: {
        OR: [
          { id: idOrCode },
          { currencyId: idOrCode },
          { currency: { code: idOrCode.toUpperCase() } }
        ]
      },
      include: { currency: true }
    });

    let currencyId = rate?.currencyId;

    if (!currencyId) {
      const curr = await this.prisma.currency.findFirst({
        where: {
          OR: [{ id: idOrCode }, { code: idOrCode.toUpperCase() }]
        }
      });
      if (!curr) throw new NotFoundException('Currency not found');
      currencyId = curr.id;
    }

    // Check for foreign key usage
    const [orderItemCount, vaultCount] = await Promise.all([
      this.prisma.orderItem.count({ where: { currencyId } }),
      this.prisma.branchVault.count({ where: { currencyId } })
    ]);

    if (orderItemCount > 0 || vaultCount > 0) {
      // Soft-delete/decommission: mark currency inactive and remove exchange rate
      await this.prisma.currency.update({
        where: { id: currencyId },
        data: { isActive: false }
      });
      if (rate) {
        await this.prisma.exchangeRate.delete({ where: { id: rate.id } }).catch(() => {});
      }
    } else {
      // Hard delete
      if (rate) {
        await this.prisma.exchangeRate.delete({ where: { id: rate.id } }).catch(() => {});
      }
      await this.prisma.exchangeRateHistory.deleteMany({ where: { currencyId } }).catch(() => {});
      await this.prisma.currency.delete({ where: { id: currencyId } }).catch(() => {});
    }

    this.eventBus.publish('LiveRatesUpdated', { deletedCurrencyId: currencyId });
    return { success: true, message: 'Currency successfully removed' };
  }

  async updateRate(id: string, inrRate: number, marginBuyPct: number, marginSellPct: number) {
    const rate = await this.prisma.exchangeRate.update({
      where: { id },
      data: {
        inrRate,
        marginBuyPct,
        marginSellPct
      },
      include: { currency: true }
    });

    // Write to history
    await this.prisma.exchangeRateHistory.create({
      data: {
        currencyId: rate.currencyId,
        inrRate
      }
    });

    // Publish event
    this.eventBus.publish('LiveRatesUpdated', { rateId: id, inrRate, buyMargin: marginBuyPct });

    return rate;
  }

  async getProducts() {
    return this.prisma.forexProduct.findMany({});
  }

  async updateProduct(id: string, isActive: boolean) {
    return this.prisma.forexProduct.update({
      where: { id },
      data: { isActive }
    });
  }
}
