import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus, OrderStatus } from '@prisma/client';
import { QuotesService } from '../quotes/quotes.service';

import { DomainEventBus } from '../common/event-bus/domain-event-bus.service';

@Injectable()
export class TransactionEngineService {
  private readonly logger = new Logger(TransactionEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesService: QuotesService,
    private readonly eventBus: DomainEventBus
  ) {}

  /**
   * Initializes a new Transaction Session (Draft Order).
   */
  async createSession(userId?: string) {
    const session = await this.prisma.transactionSession.create({
      data: {
        userId: userId || null,
        status: SessionStatus.CREATED,
        draftState: {},
      },
    });
    this.logger.log(`Created Transaction Session: ${session.id}`);
    return session;
  }

  /**
   * Updates the JSON draft state (saves progress).
   */
  async updateDraftState(sessionId: string, draftState: any, requestingUserId?: string) {
    const session = await this.prisma.transactionSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === SessionStatus.CONVERTED) throw new BadRequestException('Session is already converted to an order');

    const updateData: any = {
      draftState: draftState,
      status: SessionStatus.IN_PROGRESS 
    };

    if (requestingUserId && !session.userId) {
      updateData.userId = requestingUserId;
    }

    const updated = await this.prisma.transactionSession.update({
      where: { id: sessionId },
      data: updateData,
    });
    return updated;
  }

  /**
   * Dynamic Workflow Engine Integration
   * Analyzes the session draft state and returns the next required step.
   */
  async getWorkflowNextStep(sessionId: string, requestingUserId?: string) {
    let session = await this.prisma.transactionSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Opportunistically claim session if the user just logged in or is logged in
    if (requestingUserId && !session.userId) {
      session = await this.prisma.transactionSession.update({
        where: { id: sessionId },
        data: { userId: requestingUserId }
      });
      this.logger.log(`Session ${sessionId} claimed by user ${requestingUserId}`);
    }

    const state = session.draftState as any || {};
    
    // Workflow Logic based on Draft State
    let currentState = session.status;
    let allowedActions = ['CHANGE_PRODUCT', 'CHANGE_CURRENCY', 'ENTER_AMOUNT'];
    let progress = 10;

    if (state.product && state.currency && state.amount) {
      progress = 30;
      allowedActions.push('GET_QUOTE');
      
      // If user is not authenticated, they must login before locking quote
      if (!session.userId) {
        currentState = SessionStatus.WAITING_LOGIN;
        allowedActions = ['LOGIN_OR_REGISTER'];
      }
    }

    if (session.status === SessionStatus.QUOTE_LOCKED) {
      progress = 50;
      allowedActions = ['ENTER_DELIVERY_DETAILS', 'ENTER_TRAVEL_DETAILS'];
      
      if (state.product === 'CARD') {
        // Forex cards don't need delivery if reloading
        allowedActions = allowedActions.filter(a => a !== 'ENTER_DELIVERY_DETAILS');
      }
    }

    if (session.status === SessionStatus.WAITING_PAYMENT) {
      progress = 90;
      allowedActions = ['PAY_NOW', 'CANCEL_ORDER'];
    }

    return {
      sessionId,
      currentState,
      allowedActions,
      progress
    };
  }

  /**
   * Orchestrates Quote Generation and attaches to Session.
   */
  async generateAndLockQuote(sessionId: string, dto: { currency: string, product: string, amount: number, branchId: string }) {
    const session = await this.prisma.transactionSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === SessionStatus.CONVERTED) throw new BadRequestException('Session is already converted to an order');
    if (!session.userId) throw new BadRequestException('User must be authenticated to lock a quote');

    // Generate Quote via QuotesService
    const quoteData = await this.quotesService.generateQuote(session.userId, {
      ...dto,
      sessionId
    });

    // Transition Session
    await this.prisma.transactionSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.QUOTE_LOCKED }
    });

    return quoteData;
  }

  /**
   * Idempotent Checkout - converts Session + Quote into an Order.
   */
  async checkout(sessionId: string, idempotencyKey: string) {
    const session = await this.prisma.transactionSession.findUnique({ 
      where: { id: sessionId },
      include: { quotes: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status === SessionStatus.CONVERTED) {
      // Idempotency: Return existing order
      return this.prisma.order.findFirst({ where: { sessionId } });
    }
    
    if (session.idempotencyKey && session.idempotencyKey !== idempotencyKey) {
      throw new BadRequestException('Invalid idempotency key provided for this session');
    }

    const activeQuote = session.quotes[0];
    if (!activeQuote) throw new BadRequestException('No active quote found for this session');
    const currentDate = (global as any).devMockTime ? new Date((global as any).devMockTime) : new Date();
    if (activeQuote.expiresAt < currentDate) {
      await this.prisma.quote.update({ where: { id: activeQuote.id }, data: { status: 'EXPIRED' }});
      await this.prisma.transactionSession.update({ where: { id: sessionId }, data: { status: SessionStatus.EXPIRED }});
      throw new BadRequestException('Quote has expired. Please generate a new quote.');
    }

    if (!session.userId) throw new BadRequestException('User must be authenticated to checkout');

    // Resolve profile and branch
    const profile = await this.prisma.customerProfile.findUnique({ 
      where: { userId: session.userId },
      include: { user: true }
    });
    if (!profile) throw new BadRequestException('Customer profile incomplete');
    
    const draftState = session.draftState as any || {};
    let branchId = draftState.branchId;
    if (!branchId) {
      // For MVP, auto-assign the first available branch if none selected
      const defaultBranch = await this.prisma.branch.findFirst();
      if (!defaultBranch) throw new BadRequestException('System configuration error: No branches available');
      branchId = defaultBranch.id;
    }

    // Look up the actual ForexProduct ID using the code from draftState
    let productCode = draftState.product;
    if (productCode === 'CARD') productCode = 'FOREX_CARD'; // Map frontend code to DB code

    if (!productCode) throw new BadRequestException('Product code not found in draft state');
    const forexProduct = await this.prisma.forexProduct.findUnique({ where: { code: productCode } });
    if (!forexProduct) throw new BadRequestException(`Invalid product code: ${productCode}`);
    if (!forexProduct.isActive) throw new BadRequestException(`The product "${forexProduct.name}" is temporarily disabled by administrator.`);

    // Update travel purpose if provided
    if (draftState.purpose) {
      await this.prisma.customerProfile.update({
        where: { id: profile.id },
        data: { travelPurpose: draftState.purpose }
      });
    }

    const deliveryMethod = draftState.deliveryMethod || 'PICKUP';
    const addressId = draftState.addressId;

    const productType = productCode;
    const isPickup = deliveryMethod === 'PICKUP' || deliveryMethod === 'STORE_PICKUP';
    const isDelivery = deliveryMethod === 'HOME_DELIVERY';

    let workflowType = 'CASH_PICKUP';
    if (productType === 'CASH') {
      workflowType = isDelivery ? 'CASH_DELIVERY' : 'CASH_PICKUP';
    } else if (productType === 'CASH_SELL') {
      workflowType = isDelivery ? 'CASH_SELL_DELIVERY' : 'CASH_SELL_PICKUP';
    } else if (productType === 'FOREX_CARD') {
      workflowType = draftState.isReload ? 'CARD_RELOAD' : 'CARD_PICKUP';
    } else if (productType === 'REMITTANCE') {
      workflowType = 'REMITTANCE_OUTWARD';
    }

    const requiresKyc = true;
    const isRemittance = productType === 'REMITTANCE';
    const requiresInventory = !isRemittance && (productType === 'CASH' || (productType === 'FOREX_CARD' && !draftState.isReload));
    const requiresPickupHandover = !isRemittance && isPickup;
    const requiresDelivery = !isRemittance && isDelivery;
    const currentStage = 'KYC_STAGE';

    // Create Order within a Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const initialStatus = (productType === 'CASH_SELL' || isRemittance) ? OrderStatus.PENDING : OrderStatus.PAYMENT_PENDING;

      let baseTotalAmountInr = activeQuote.lockedInrRate.toNumber() * activeQuote.amountForeign.toNumber();
      if (isRemittance) {
        const fee = draftState.feeAmount ? Number(draftState.feeAmount) : 0;
        const tcs = draftState.tcsAmount ? Number(draftState.tcsAmount) : 0;
        baseTotalAmountInr += fee + tcs;
      }

      const ord = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          sessionId: session.id,
          quoteId: activeQuote.id,
          profileId: profile.id,
          branchId,
          totalAmountInr: baseTotalAmountInr,
          deliveryMethod,
          status: initialStatus,
          productType,
          workflowType,
          currentStage,
          requiresKyc,
          requiresInventory,
          requiresPickupHandover,
          requiresDelivery,
          complianceStatus: 'PENDING',
          travelDestination: draftState.destination || null,
          departureDate: draftState.departureDate ? new Date(draftState.departureDate) : null,
          returnDate: draftState.returnDate ? new Date(draftState.returnDate) : null,
          items: {
            create: {
              productId: forexProduct.id,
              currencyId: activeQuote.currencyId,
              amount: activeQuote.amountForeign,
              rate: activeQuote.lockedInrRate,
              inrSubtotal: activeQuote.lockedInrRate.toNumber() * activeQuote.amountForeign.toNumber()
            }
          },
          history: {
            create: {
              status: initialStatus,
              changedById: session.userId as string,
              comments: 'Order created from Transaction Engine'
            }
          },
          ...((deliveryMethod === 'HOME_DELIVERY' && !isRemittance) ? {
            deliveryJob: {
              create: {
                deliveryAddress: draftState.deliveryAddress || 'Address not provided',
                contactPerson: profile.user.fullName || 'Customer'
              }
            },
            ...(addressId && !addressId.startsWith('temp-') ? {
              deliveries: {
                create: {
                  addressId,
                  status: 'PENDING'
                }
              }
            } : {})
          } : {})
        }
      });

      if (isRemittance) {
        let beneficiaryId = draftState.beneficiaryId;
        let benName = draftState.beneficiaryName;
        let benBank = draftState.beneficiaryBank;
        let benSwift = draftState.swiftCode;
        let benAccount = draftState.ibanOrAccountNumber;
        let benAddress = draftState.beneficiaryAddress;
        let benCountry = draftState.beneficiaryCountry || draftState.country;

        if (!beneficiaryId && benName && benBank && benSwift && benAccount) {
          const beneficiary = await tx.beneficiary.create({
            data: {
              profileId: profile.id,
              name: benName,
              bankName: benBank,
              swiftCode: benSwift,
              ibanOrAccountNumber: benAccount,
              address: benAddress || '',
              country: benCountry || '',
            }
          });
          beneficiaryId = beneficiary.id;
        } else if (beneficiaryId) {
          const beneficiary = await tx.beneficiary.findUnique({
            where: { id: beneficiaryId }
          });
          if (beneficiary) {
            benName = beneficiary.name;
            benBank = beneficiary.bankName;
            benSwift = beneficiary.swiftCode;
            benAccount = beneficiary.ibanOrAccountNumber;
            benAddress = beneficiary.address;
            benCountry = beneficiary.country;
          }
        }

        const purposeId = draftState.purposeId;
        const sourceOfFunds = draftState.sourceOfFunds;
        const relationship = draftState.relationship;
        const chargeType = draftState.chargeType || 'OUR';
        const paymentMethod = draftState.paymentMethod || 'BANK_TRANSFER';
        const feeAmount = draftState.feeAmount ? Number(draftState.feeAmount) : null;
        const tcsAmount = draftState.tcsAmount ? Number(draftState.tcsAmount) : null;

        const createdOrderItem = await tx.orderItem.findFirst({
          where: { orderId: ord.id }
        });

        if (createdOrderItem) {
          await tx.remittanceDetail.create({
            data: {
              orderItemId: createdOrderItem.id,
              beneficiaryName: benName || '',
              beneficiaryBank: benBank || '',
              swiftCode: benSwift || '',
              ibanOrAccountNumber: benAccount || '',
              beneficiaryAddress: benAddress || '',
              beneficiaryId,
              purposeId,
              sourceOfFunds,
              relationship,
              chargeType,
              paymentMethod,
              feeAmount,
              tcsAmount,
            }
          });
        }
      }

      await tx.transactionSession.update({
        where: { id: session.id },
        data: { status: SessionStatus.CONVERTED, idempotencyKey }
      });

      await tx.quote.update({
        where: { id: activeQuote.id },
        data: { status: 'CONVERTED' }
      });

      if (productType === 'CASH_SELL') {
        // 1. Customer Notification
        await tx.inAppNotification.create({
          data: {
            userId: session.userId as string,
            title: 'Order Created',
            message: `Your Cash Sell order ${ord.orderNumber} has been created successfully. Awaiting KYC review.`,
            actionUrl: `/dashboard/orders/${ord.id}`,
            orderId: ord.id
          }
        });

        // 2. Branch Operations/KYC Staff Notification
        const branchStaff = await tx.branchStaff.findMany({
          where: { branchId },
          include: { user: { include: { roleRef: true } } }
        });
        const opsStaff = branchStaff.filter(
          (s) => s.user.roleRef?.name === 'BRANCH_OPERATIONS_STAFF' || 
                 s.user.roleRef?.name === 'STAFF' || 
                 s.user.roleRef?.name === 'BRANCH_KYC_STAFF' ||
                 s.user.roleRef?.name === 'BRANCH_OPERATIONS'
        );
        for (const staff of opsStaff) {
          await tx.inAppNotification.create({
            data: {
              userId: staff.userId,
              title: 'New Lead',
              message: `New Cash Sell lead ${ord.orderNumber} is available in your queue.`,
              actionUrl: `/ops/tasks`,
              orderId: ord.id
            }
          });
        }

        // 3. Manager Notification
        const managers = branchStaff.filter(
          (s) => s.user.roleRef?.name === 'BRANCH_MANAGER' || s.designation === 'MANAGER'
        );
        for (const mgr of managers) {
          await tx.inAppNotification.create({
            data: {
              userId: mgr.userId,
              title: 'New Cash Sell Order',
              message: `A new Cash Sell order ${ord.orderNumber} has been placed.`,
              actionUrl: `/manager/queue`,
              orderId: ord.id
            }
          });
        }
      }

      // Task Engine: Automatically queue tasks matching workflow
      if (requiresKyc) {
        await tx.branchTask.create({
          data: {
            branchId,
            orderId: ord.id,
            taskType: 'KYC_REVIEW',
            status: 'PENDING',
            notes: 'Perform KYC compliance check for order documents',
            queueRoleCode: 'BRANCH_KYC_STAFF'
          }
        });
      }

      if (requiresInventory) {
        await tx.branchTask.create({
          data: {
            branchId,
            orderId: ord.id,
            taskType: 'INVENTORY_PREP',
            status: 'PENDING',
            notes: 'Allocate and verify notes/card inventory',
            queueRoleCode: 'BRANCH_INVENTORY_STAFF'
          }
        });
      }

      if (requiresPickupHandover) {
        await tx.branchTask.create({
          data: {
            branchId,
            orderId: ord.id,
            taskType: 'HANDOVER',
            status: 'PENDING',
            notes: 'Awaiting customer branch pickup verification',
            queueRoleCode: 'BRANCH_CASHIER'
          }
        });
      }

      if (requiresDelivery) {
        await tx.branchTask.create({
          data: {
            branchId,
            orderId: ord.id,
            taskType: 'HANDOVER',
            status: 'PENDING',
            notes: 'Awaiting dispatch/delivery agent assignment',
            queueRoleCode: 'BRANCH_FULFILLMENT_STAFF'
          }
        });
      }

      return ord;
    });

    this.logger.log(`Session ${sessionId} converted to Order ${order.id}`);
    this.eventBus.publish('OrderCreated', { orderId: order.id, userId: order.profileId, branchId: order.branchId, order });
    
    return order;
  }
}
