import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';
import { mapOrderStatus } from '../common/utils/workflow';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async evaluateKycEligibilityInternal(profileId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { id: profileId }
    });
    if (!profile) return { eligible: false, complianceStatus: 'PENDING' };

    const purpose = profile.travelPurpose || 'TOURISM';
    
    const latestOrder = await this.prisma.order.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    const isSell = latestOrder?.productType === 'CASH_SELL';

    let rules = await this.prisma.kycVerificationRule.findMany({
      where: {
        isActive: true,
        OR: [
          { product: null },
          { product: 'CASH_BUY' },
          { product: 'CASH_SELL' }
        ],
        AND: [
          {
            OR: [
              { purpose: null },
              { purpose: purpose }
            ]
          }
        ]
      }
    });

    if (isSell) {
      rules = rules.filter(r => r.docType === 'PAN' || r.docType === 'PASSPORT');
    }

    const requiredDocTypes = rules.filter(r => r.required).map(r => r.docType);
    
    const docs = await this.prisma.kycDocument.findMany({
      where: { userId: profile.userId }
    });

    const docStates: Record<string, string> = {};
    for (const type of requiredDocTypes) {
      const doc = docs.find(d => d.docType === type);
      if (!doc) {
        docStates[type] = 'MISSING';
      } else {
        docStates[type] = doc.status;
      }
    }

    const allApproved = requiredDocTypes.every(type => docStates[type] === 'APPROVED');
    const hasRejected = requiredDocTypes.some(type => docStates[type] === 'REJECTED');
    const hasReviewing = requiredDocTypes.some(type => docStates[type] === 'REVIEWING');
    const hasPending = requiredDocTypes.some(type => docStates[type] === 'PENDING');

    let complianceStatus = 'PENDING';
    if (profile.kycOverallStatus === 'VERIFIED' || allApproved) {
      complianceStatus = 'APPROVED';
    } else if (hasRejected) {
      complianceStatus = 'REJECTED';
    } else if (hasReviewing) {
      complianceStatus = 'REVIEWING';
    } else if (hasPending) {
      complianceStatus = 'PENDING';
    } else {
      complianceStatus = 'MISSING';
    }

    return {
      eligible: profile.kycOverallStatus === 'VERIFIED' || allApproved,
      complianceStatus
    };
  }

  async evaluateLrsEligibilityInternal(profileId: string, orderAmountInr: number) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });
    
    if (!profile) return { eligible: false, reason: 'Profile not found' };

    const docs = await this.prisma.kycDocument.findMany({
      where: { userId: profile.userId }
    });

    const panDoc = docs.find(d => d.docType === 'PAN');
    const passportDoc = docs.find(d => d.docType === 'PASSPORT');

    if (!panDoc || panDoc.status !== 'APPROVED') {
      return { eligible: false, reason: 'PAN is not approved' };
    }

    if (!passportDoc || passportDoc.status !== 'APPROVED') {
      return { eligible: false, reason: 'Passport is not approved' };
    }

    if (!profile.travelPurpose) {
      return { eligible: false, reason: 'Travel purpose is not selected' };
    }

    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    
    const lrsTracker = await this.prisma.lrsLimitTracker.findUnique({
      where: {
        profileId_financialYear: {
          profileId,
          financialYear
        }
      }
    });

    const trackerSpentUsd = lrsTracker 
      ? Number(lrsTracker.declaredAmountUsd || 0) + Number(lrsTracker.systemSpentAmountUsd || 0)
      : 0;
    
    const trackerSpentInr = trackerSpentUsd * 83; // Conversion rate

    const activeOrders = await this.prisma.order.findMany({
      where: {
        profileId,
        status: { notIn: ['CANCELLED', 'REJECTED'] }
      }
    });

    const activeOrdersInr = activeOrders.reduce((sum, o) => sum + Number(o.totalAmountInr || 0), 0);

    const limitInr = 10000000; // ₹100 Lakhs (1 Crore INR)
    const totalSpentInr = trackerSpentInr + activeOrdersInr;
    const remainingInr = Math.max(0, limitInr - totalSpentInr);

    if (totalSpentInr + orderAmountInr > limitInr) {
      return {
        eligible: false,
        reason: 'LRS Limit Exceeded',
        remainingInr,
        totalSpentInr,
        orderAmountInr
      };
    }

    return {
      eligible: true,
      remainingInr: limitInr - (totalSpentInr + orderAmountInr),
      totalSpentInr,
      orderAmountInr
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new BadRequestException('User profile not found');
    }

    const quote = await this.prisma.quote.findUnique({
      where: { id: dto.quoteId },
      include: { currency: true }
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (quote.status === 'CONVERTED') {
      throw new BadRequestException('Quote has already been used');
    }

    const currentDate = (global as any).devMockTime ? new Date((global as any).devMockTime) : new Date();
    if (currentDate > quote.expiresAt) {
      throw new BadRequestException('Quote has expired');
    }

    if (quote.profileId !== profile.id) {
      throw new ForbiddenException('Quote belongs to a different user');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId }
    });

    if (!branch) {
      throw new BadRequestException('Invalid branch selected');
    }

    const session = quote.sessionId
      ? await this.prisma.transactionSession.findUnique({
          where: { id: quote.sessionId },
        })
      : null;

    const draftState = (session?.draftState as any) || {};
    let productCode = draftState.product || 'CASH';
    if (productCode === 'CARD') productCode = 'FOREX_CARD';

    const productType = productCode;
    const isPickup = dto.deliveryMethod === 'PICKUP' || dto.deliveryMethod === 'STORE_PICKUP';
    const isDelivery = dto.deliveryMethod === 'HOME_DELIVERY';

    let workflowType = 'CASH_PICKUP';
    if (productType === 'CASH') {
      workflowType = isDelivery ? 'CASH_DELIVERY' : 'CASH_PICKUP';
    } else if (productType === 'FOREX_CARD') {
      workflowType = draftState.isReload ? 'CARD_RELOAD' : 'CARD_PICKUP';
    } else if (productType === 'REMITTANCE') {
      workflowType = 'REMITTANCE_OUTWARD';
    }

    const requiresKyc = true;
    const requiresInventory = productType === 'CASH' || (productType === 'FOREX_CARD' && !draftState.isReload);
    const requiresPickupHandover = isPickup;
    const requiresDelivery = isDelivery;

    const forexProduct = await this.prisma.forexProduct.findUnique({
      where: { code: productCode },
    });

    if (!forexProduct) {
      throw new BadRequestException(`Product code ${productCode} not found in database`);
    }

    if (!forexProduct.isActive) {
      throw new BadRequestException(`The product "${forexProduct.name}" is temporarily disabled by administrator.`);
    }

    const orderNumber = `ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const totalAmountInr = quote.lockedInrRate.toNumber() * quote.amountForeign.toNumber();

    // Gating KYC layer
    const kycEligible = await this.evaluateKycEligibilityInternal(profile.id);
    let initialStatus: OrderStatus = kycEligible.eligible ? OrderStatus.PAYMENT_PENDING : OrderStatus.PENDING;
    let currentStage = kycEligible.eligible ? 'PAYMENT_STAGE' : 'KYC_STAGE';
    let complianceStatus = kycEligible.complianceStatus;
    let lrsReason = '';
    let remainingInr = 0;

    // Run LRS Check if KYC is already eligible
    if (kycEligible.eligible) {
      const lrsCheck = await this.evaluateLrsEligibilityInternal(profile.id, totalAmountInr);
      if (!lrsCheck.eligible) {
        initialStatus = OrderStatus.CANCELLED;
        currentStage = 'KYC_STAGE';
        complianceStatus = 'LRS_FAILED';
        lrsReason = lrsCheck.reason || 'LRS Limit Exceeded';
        remainingInr = lrsCheck.remainingInr || 0;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Mark quote as used
      await tx.quote.update({
        where: { id: quote.id },
        data: { status: 'CONVERTED' }
      });

      const order = await tx.order.create({
        data: {
          orderNumber,
          quoteId: quote.id,
          profileId: profile.id,
          branchId: branch.id,
          totalAmountInr,
          deliveryMethod: dto.deliveryMethod,
          status: initialStatus,
          productType,
          workflowType,
          currentStage,
          requiresKyc,
          requiresInventory,
          requiresPickupHandover,
          requiresDelivery,
          complianceStatus,
          items: {
            create: {
              productId: forexProduct.id,
              currencyId: quote.currencyId,
              amount: quote.amountForeign,
              rate: quote.lockedInrRate,
              inrSubtotal: totalAmountInr,
            },
          },
        }
      });

      // ── Auto-queue Branch Workflow Tasks ─────────────────────────────────
      if (requiresKyc && complianceStatus !== 'LRS_FAILED') {
        await tx.branchTask.create({
          data: {
            branchId: branch.id,
            orderId: order.id,
            taskType: 'KYC_REVIEW',
            status: 'PENDING',
            notes: 'Perform KYC compliance check for order documents',
            queueRoleCode: 'BRANCH_KYC_STAFF'
          }
        });
      }

      if (requiresInventory && complianceStatus !== 'LRS_FAILED') {
        await tx.branchTask.create({
          data: {
            branchId: branch.id,
            orderId: order.id,
            taskType: 'INVENTORY_PREP',
            status: 'PENDING',
            notes: 'Allocate and verify notes/card inventory',
            queueRoleCode: 'BRANCH_INVENTORY_STAFF'
          }
        });
      }

      if (requiresPickupHandover && complianceStatus !== 'LRS_FAILED') {
        await tx.branchTask.create({
          data: {
            branchId: branch.id,
            orderId: order.id,
            taskType: 'HANDOVER',
            status: 'PENDING',
            notes: 'Awaiting customer branch pickup verification',
            queueRoleCode: 'BRANCH_CASHIER'
          }
        });
      }

      if (requiresDelivery && complianceStatus !== 'LRS_FAILED') {
        await tx.branchTask.create({
          data: {
            branchId: branch.id,
            orderId: order.id,
            taskType: 'HANDOVER',
            status: 'PENDING',
            notes: 'Awaiting dispatch/delivery agent assignment',
            queueRoleCode: 'BRANCH_FULFILLMENT_STAFF'
          }
        });
      }

      // Create history record
      let historyComments = kycEligible.eligible
        ? 'Order created. KYC approved, awaiting payment.'
        : 'Order created. Awaiting KYC submission/approval.';

      if (complianceStatus === 'LRS_FAILED') {
        historyComments = `LRS Limit Exceeded. You cannot purchase this amount. Remaining Limit: ₹${remainingInr}`;
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: initialStatus,
          changedById: userId,
          comments: historyComments,
        }
      });

      if (complianceStatus === 'LRS_FAILED') {
        await tx.inAppNotification.create({
          data: {
            userId,
            title: 'LRS Limit Exceeded',
            message: `Your order ${orderNumber} was cancelled. You cannot purchase this amount. Remaining LRS Limit: ₹${remainingInr}`,
            actionUrl: `/dashboard/orders/${order.id}`,
            orderId: order.id
          }
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: complianceStatus === 'LRS_FAILED' ? 'CREATE_ORDER_LRS_FAILED' : 'CREATE_ORDER',
          entityName: 'Order',
          entityId: order.id,
          newData: { orderNumber, totalAmountInr, initialStatus, complianceStatus }
        }
      });

      return order;
    });
  }

  async findAllForUser(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) return [];

    const orders = await this.prisma.order.findMany({
      where: { profileId: profile.id },
      include: {
        quote: { include: { currency: true } },
        branch: true,
        tasks: true,
        items: {
          include: {
            product: true,
            currency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      ...o,
      mappedStatus: mapOrderStatus(o),
      status: mapOrderStatus(o)
    }));
  }

  async findOne(orderId: string, userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        quote: { include: { currency: true } },
        branch: true,
        tasks: true,
        items: {
          include: {
            product: true,
            currency: true
          }
        },
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (profile && order.profileId !== profile.id) {
       const userRole = await this.prisma.user.findUnique({
         where: { id: userId },
         include: { roleRef: true }
       });
       
       if (userRole?.roleRef?.name === 'CUSTOMER') {
         throw new ForbiddenException('You are not authorized to view this order');
       }
    }

    return {
      ...order,
      mappedStatus: mapOrderStatus(order),
      status: mapOrderStatus(order)
    };
  }

  async updateStatus(orderId: string, status: any) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    
    return order;
  }

  async requestCancel(orderId: string, reason: string, userId: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('A valid reason is required for cancellation.');
    }

    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new BadRequestException('User profile not found');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.profileId !== profile.id) {
      throw new ForbiddenException('You are not authorized to cancel this order');
    }

    const uncancellableStatuses: OrderStatus[] = [
      OrderStatus.DISPATCHED,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
      OrderStatus.REJECTED
    ];

    if (uncancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order cannot be cancelled in its current status: ${order.status}`);
    }

    if (order.cancelRequested) {
      throw new BadRequestException('Cancellation has already been requested for this order.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          cancelRequested: true,
          cancelReason: reason
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          changedById: userId,
          comments: `Cancellation requested by customer. Reason: ${reason}`
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REQUEST_CANCEL_ORDER_CUSTOMER',
          entityName: 'Order',
          entityId: orderId,
          newData: { cancelRequested: true, cancelReason: reason }
        }
      });

      return {
        ...updatedOrder,
        mappedStatus: mapOrderStatus(updatedOrder),
        status: mapOrderStatus(updatedOrder)
      };
    });
  }

  async createDirectCheckout(authUserId: string | null, data: any) {
    const email = data.email?.trim().toLowerCase() || `customer_${Date.now()}@forexmate.in`;
    const cleanMobile = data.phone?.replace(/\D/g, '') || data.mobile?.replace(/\D/g, '') || '9876543210';
    const fullName = data.travellerName?.trim() || data.fullName?.trim() || 'Customer';

    let user = authUserId ? await this.prisma.user.findUnique({ where: { id: authUserId } }) : null;
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { OR: [{ email }, { mobile: cleanMobile }] }
      });
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          password: 'mock_guest_password_hash',
          mobile: cleanMobile,
          fullName,
          status: 'ACTIVE',
          userType: 'CUSTOMER'
        }
      });
    }

    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      try {
        profile = await this.prisma.customerProfile.create({
          data: {
            userId: user.id,
            panNumber: data.pan || null,
            travelPurpose: data.purpose || 'TOURISM'
          }
        });
      } catch (_) {
        profile = await this.prisma.customerProfile.create({
          data: {
            userId: user.id,
            travelPurpose: data.purpose || 'TOURISM'
          }
        });
      }
    } else if (data.pan && !profile.panNumber) {
      try {
        await this.prisma.customerProfile.update({
          where: { id: profile.id },
          data: { panNumber: data.pan }
        });
      } catch (_) {}
    }

    let branchId = data.branchId;
    if (!branchId) {
      const defaultBranch = await this.prisma.branch.findFirst();
      branchId = defaultBranch?.id;
    }

    const isSell = data.product === 'CASH_SELL';
    const isRemittance = data.product === 'REMITTANCE';
    const isCard = data.product === 'FOREX_CARD' || data.product === 'CARD';
    const productType = isSell ? 'CASH_SELL' : isRemittance ? 'REMITTANCE' : isCard ? 'FOREX_CARD' : 'CASH_BUY';
    const deliveryMethod = data.deliveryMethod || (isRemittance ? 'WIRE_TRANSFER' : 'BRANCH_PICKUP');
    const isPickup = ['BRANCH_PICKUP', 'PICKUP', 'STORE_PICKUP'].includes(deliveryMethod);
    const isDelivery = ['HOME_DELIVERY', 'DELIVERY'].includes(deliveryMethod);

    let workflowType = 'CASH_BUY_FLOW';
    if (isSell) {
      workflowType = isDelivery ? 'CASH_SELL_DELIVERY' : 'CASH_SELL_PICKUP';
    } else if (isRemittance) {
      workflowType = 'REMITTANCE_OUTWARD';
    } else if (isCard) {
      workflowType = isDelivery ? 'CARD_DELIVERY' : 'CARD_PICKUP';
    } else {
      workflowType = isDelivery ? 'CASH_DELIVERY' : 'CASH_PICKUP';
    }

    const orderNumber = data.orderNumber || (data.bookingRef ? data.bookingRef : `ORD-${Date.now()}`);

    let productRecord = await this.prisma.forexProduct.findUnique({
      where: { code: productType }
    });
    if (!productRecord) {
      productRecord = await this.prisma.forexProduct.findFirst();
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          profileId: profile.id,
          branchId,
          totalAmountInr: data.totalAmountInr || 0,
          deliveryMethod,
          status: isSell ? OrderStatus.PAYMENT_COMPLETED : OrderStatus.PENDING,
          productType,
          workflowType,
          currentStage: 'KYC_STAGE',
          requiresKyc: true,
          requiresInventory: !isRemittance,
          requiresPickupHandover: isPickup,
          requiresDelivery: isDelivery,
          complianceStatus: 'PENDING',
          travelDestination: data.destination || null,
          departureDate: data.departureDate ? new Date(data.departureDate) : null,
          returnDate: data.returnDate ? new Date(data.returnDate) : null
        }
      });

      if (Array.isArray(data.items) && data.items.length > 0) {
        for (const item of data.items) {
          const currCode = item.currency || 'USD';
          let currency = await tx.currency.findUnique({ where: { code: currCode } });
          if (!currency) {
            currency = await tx.currency.create({
              data: { code: currCode, name: currCode, symbol: currCode }
            });
          }

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: productRecord?.id || '',
              currencyId: currency.id,
              amount: item.amount || 0,
              rate: item.rate || 1,
              inrSubtotal: item.inrEquivalent || item.inrValue || (item.amount * item.rate) || 0
            }
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          changedById: user.id,
          comments: `Order placed online by customer (${fullName}). Mode: ${deliveryMethod}`
        }
      });

      if (isDelivery && data.deliveryAddress) {
        const addr = await tx.customerAddress.create({
          data: {
            profileId: profile.id,
            address: data.deliveryAddress,
            city: data.city || 'Delhi',
            state: data.state || 'Delhi',
            pin: data.pincode || '110001',
            landmark: data.landmark || null
          }
        });

        await tx.orderDelivery.create({
          data: {
            orderId: order.id,
            addressId: addr.id,
            status: 'PENDING'
          }
        });
      }

      return order;
    });
  }
}
