import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapOrderStatus } from '../common/utils/workflow';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        try {
          profile = await this.prisma.customerProfile.create({
            data: {
              userId: user.id,
              travelPurpose: 'TOURISM'
            }
          });
        } catch (_) {}
      }
    }

    if (!profile) {
      return {
        totalOrders: 0,
        activeForexCards: 0,
        lrsUsage: 0,
        kycStatus: 'PENDING',
        pendingOrders: 0,
        completedOrders: 0,
        activeQuotes: 0,
        lastOrderDate: null,
        recentOrders: []
      };
    }

    const profileId = profile.id;

    // Run queries concurrently
    const [
      totalOrders,
      ordersByStatus,
      activeQuotes,
      lastOrder,
      recentOrders,
      lrsAggregation,
      activeForexCards
    ] = await Promise.all([
      // Total orders
      this.prisma.order.count({ where: { profileId } }),
      
      // Group orders by status
      this.prisma.order.groupBy({
        by: ['status'],
        where: { profileId },
        _count: { _all: true }
      }),

      // Active quotes
      this.prisma.quote.count({
        where: {
          profileId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        }
      }),

      // Last order date
      this.prisma.order.findFirst({
        where: { profileId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),

      // Recent 5 orders with full relations
      this.prisma.order.findMany({
        where: { profileId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: true,
          quote: true,
          tasks: true,
          items: {
            include: {
              product: true,
              currency: true
            }
          }
        }
      }),

      // LRS Usage (Sum of totalAmountInr for non-cancelled orders)
      this.prisma.order.aggregate({
        where: {
          profileId,
          status: { notIn: ['CANCELLED', 'REJECTED'] }
        },
        _sum: { totalAmountInr: true }
      }),

      // Active Forex Cards (mock for now, or count unique cards issued)
      // Let's count completed orders that contain a FOREX_CARD product
      this.prisma.order.count({
        where: {
          profileId,
          status: 'COMPLETED',
          items: {
            some: {
              product: { code: 'FOREX_CARD' }
            }
          }
        }
      })
    ]);

    // Compute status counts
    const statusCounts = ordersByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    const pendingStatuses = ['PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'PENDING_KYC', 'UNDER_REVIEW'];
    const pendingOrders = pendingStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
    const completedOrders = statusCounts['COMPLETED'] || 0;

    const mappedRecentOrders = recentOrders.map(o => ({
      ...o,
      status: mapOrderStatus(o)
    }));

    return {
      totalOrders,
      activeForexCards,
      lrsUsage: Number(lrsAggregation._sum.totalAmountInr || 0),
      kycStatus: profile.kycOverallStatus || 'PENDING',
      pendingOrders,
      completedOrders,
      activeQuotes,
      lastOrderDate: lastOrder?.createdAt || null,
      recentOrders: mappedRecentOrders
    };
  }
}
