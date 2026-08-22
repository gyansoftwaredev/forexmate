import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';
import { mapOrderStatus } from '../common/utils/workflow';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      ordersToday,
      ordersMonth,
      pendingCompliance,
      pendingBranchExecution,
      pendingDeliveries,
      completedOrders,
      cancelledOrders,
      todayRevenueStats,
      monthRevenueStats,
      auditLogs,
      branchesCount,
      citiesCount,
      employeesCount,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      this.prisma.order.count({ where: { complianceStatus: 'PENDING' } }),
      this.prisma.order.count({ where: { currentStage: 'FULFILLMENT_STAGE', status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      this.prisma.order.count({ where: { deliveryMethod: 'HOME_DELIVERY', status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: today } },
        _sum: { totalAmountInr: true },
      }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: firstDayOfMonth } },
        _sum: { totalAmountInr: true },
      }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count(),
      this.prisma.city.count(),
      this.prisma.employee.count(),
    ]);

    const branches = await this.prisma.branch.findMany({
      include: {
        branchInventory: true,
        manager: true,
        _count: { select: { orders: true } },
      },
    });

    const branchHealth = branches.map((b) => {
      const totalStock = b.branchInventory.reduce((acc, inv) => acc + Number(inv.availableAmount || 0), 0);
      return {
        id: b.id,
        name: b.branchName,
        city: b.branchCity,
        code: b.branchCode,
        manager: b.manager?.name || 'Unassigned',
        status: b.status,
        branchType: b.branchType,
        totalStock,
        orderCount: b._count.orders,
        health: totalStock < 5000 ? 'LOW_STOCK' : 'OPTIMAL',
      };
    });

    return {
      overview: {
        ordersToday,
        ordersMonth,
        pendingCompliance,
        pendingBranchExecution,
        pendingDeliveries,
        completedOrders,
        cancelledOrders,
        revenueToday: Number(todayRevenueStats._sum.totalAmountInr || 0),
        revenueMonth: Number(monthRevenueStats._sum.totalAmountInr || 0),
        branchesCount,
        citiesCount,
        employeesCount,
      },
      branchHealth,
      recentLogs: auditLogs,
    };
  }

  async getDashboardSummary(user?: any) {
    return this.getExecutiveMetrics();
  }

  async getAllOrders(user?: any) {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        profile: { include: { user: true } },
        branch: { select: { branchName: true, branchCity: true, branchCode: true } },
        cashier: { select: { name: true, employeeCode: true } },
        deliveryPartner: { select: { name: true, employeeCode: true } },
        items: { include: { product: true, currency: true } },
        cashAllocation: { include: { items: true } },
      },
    });

    return orders.map((o) => ({
      ...o,
      status: mapOrderStatus(o),
    }));
  }

  async getAllBranches() {
    return this.prisma.branch.findMany({
      include: {
        city: true,
        manager: {
          select: { id: true, name: true, employeeCode: true, phone: true, email: true },
        },
        vaults: { include: { currency: true } },
        branchInventory: true,
        _count: { select: { orders: true, employees: true } },
      },
      orderBy: { branchName: 'asc' },
    });
  }

  async createBranch(dto: {
    branchCode: string;
    branchName: string;
    branchAddress: string;
    branchCity: string;
    cityId?: string;
    branchType?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    workingHours?: string;
    vaultCapacity?: number;
  }, userId?: string) {
    const existing = await this.prisma.branch.findUnique({ where: { branchCode: dto.branchCode } });
    if (existing) {
      throw new BadRequestException(`Branch code '${dto.branchCode}' already exists.`);
    }

    const company = await this.prisma.company.findFirst();
    if (!company) {
      throw new BadRequestException('Company profile not initialized.');
    }

    const branch = await this.prisma.branch.create({
      data: {
        companyId: company.id,
        branchCode: dto.branchCode,
        branchName: dto.branchName,
        branchAddress: dto.branchAddress,
        branchCity: dto.branchCity,
        cityId: dto.cityId,
        branchType: dto.branchType || 'MAIN_BRANCH',
        lat: dto.lat,
        lng: dto.lng,
        phone: dto.phone,
        email: dto.email,
        workingHours: dto.workingHours || '09:00 AM - 06:00 PM',
        vaultCapacity: dto.vaultCapacity ? dto.vaultCapacity : 10000000.00,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'BRANCH_CREATED',
        entityName: 'Branch',
        entityId: branch.id,
        newData: { branchName: branch.branchName, branchCode: branch.branchCode },
      },
    });

    return branch;
  }

  async updateBranch(id: string, dto: any) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'BRANCH_UPDATED',
        entityName: 'Branch',
        entityId: id,
        oldData: { branchName: branch.branchName, status: branch.status },
        newData: dto,
      },
    });

    return updated;
  }

  async assignBranchManager(branchId: string, employeeId: string, adminUserId?: string) {
    const [branch, employee] = await Promise.all([
      this.prisma.branch.findUnique({ where: { id: branchId }, include: { manager: true } }),
      this.prisma.employee.findUnique({ where: { id: employeeId } }),
    ]);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.role !== 'BRANCH_MANAGER') {
      throw new BadRequestException(`Employee '${employee.name}' does not have the BRANCH_MANAGER role.`);
    }

    const previousManager = branch.manager?.name || 'None';

    // Link employee to branch as Manager
    const updatedBranch = await this.prisma.branch.update({
      where: { id: branchId },
      data: {
        managerId: employee.id,
      },
      include: {
        manager: true,
      },
    });

    // Also update employee's assigned branchId
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { branchId },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'BRANCH_MANAGER_ASSIGNED',
        entityName: 'Branch',
        entityId: branchId,
        oldData: { manager: previousManager },
        newData: { newManagerId: employee.id, newManagerName: employee.name, branchCode: branch.branchCode },
      },
    });

    return updatedBranch;
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });
  }

  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemSetting(key: string, value: string, category?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, ...(category ? { category } : {}) } as any,
      create: { key, value, category: category || 'GENERAL' } as any,
    });
  }

  async createStaff(dto: CreateStaffDto) {
    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });

    if (!role) {
      throw new BadRequestException(`Role ${dto.roleName} not found`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: role.id,
        isEmailVerified: true,
        fullName: dto.fullName,
      },
      include: { roleRef: true },
    });

    if (dto.branchId) {
      await this.prisma.branchStaff.create({
        data: {
          branchId: dto.branchId,
          userId: user.id,
          designation: dto.roleName,
          status: 'ACTIVE',
        },
      });
    }

    return user;
  }

  async getStaffList() {
    return this.prisma.user.findMany({
      where: { roleRef: { name: { not: 'CUSTOMER' } } },
      include: {
        roleRef: true,
        staffProfile: { include: { branch: true } },
      },
    });
  }

  async changeUserRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new BadRequestException(`Role ${roleName} not found`);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: { roleRef: true },
    });

    await this.prisma.userSession.deleteMany({ where: { userId } });
    return updatedUser;
  }

  async changeUserStatus(userId: string, status: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      include: { roleRef: true, staffProfile: true },
    });

    if (updatedUser.staffProfile) {
      await this.prisma.branchStaff.update({
        where: { id: updatedUser.staffProfile.id },
        data: { status },
      });
    }

    if (status !== 'ACTIVE') {
      await this.prisma.userSession.deleteMany({ where: { userId } });
    }

    return updatedUser;
  }

  async updateOrderStatus(orderId: string, newStatus: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: { include: { user: { select: { id: true, email: true, mobile: true, fullName: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const allowedStatuses = [
      'PENDING', 'KYC_SUBMITTED', 'KYC_APPROVED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED',
      'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED',
    ];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    // Find system user for audit history
    const systemUserId = await this.getSystemUserId();

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus as any,
          changedById: systemUserId,
          comments: reason
            ? `Admin override: ${newStatus}. Reason: ${reason}`
            : `Admin override: status changed to ${newStatus}`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'ADMIN_ORDER_STATUS_OVERRIDE',
          entityName: 'Order',
          entityId: orderId,
          newData: { newStatus, reason: reason || '', orderNumber: order.orderNumber },
        },
      });

      return result;
    });

    return { success: true, order: updated, message: `Order status updated to ${newStatus}` };
  }

  async approveOrderKyc(orderId: string, notes?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { profile: { include: { user: { select: { id: true, email: true, mobile: true, fullName: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.complianceStatus === 'APPROVED') {
      throw new BadRequestException('KYC already approved');
    }

    const systemUserId = await this.getSystemUserId();

    const isBuy = order.productType === 'CASH' || order.productType === 'FOREX_CARD';
    const nextStatus = isBuy ? 'PAYMENT_PENDING' : 'KYC_APPROVED';
    const nextStage = isBuy ? 'PAYMENT_STAGE' : 'FULFILLMENT_STAGE';

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          complianceStatus: 'APPROVED',
          complianceCompletedAt: new Date(),
          currentStage: nextStage,
          status: nextStatus as any,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: nextStatus as any,
          changedById: systemUserId,
          comments: notes
            ? `KYC approved by Admin. Notes: ${notes}`
            : 'KYC approved by Admin (HQ override).',
        },
      });

      await tx.branchTask.updateMany({
        where: { orderId, taskType: 'KYC_REVIEW', status: 'PENDING' },
        data: { status: 'COMPLETED' },
      });

      if (order.profile?.user?.id) {
        await tx.inAppNotification.create({
          data: {
            userId: order.profile.user.id,
            title: 'KYC Approved ✅',
            message: `Your KYC for order ${order.orderNumber} was approved. ${isBuy ? 'Complete payment to proceed.' : 'Your order is now processing.'}`,
            actionUrl: `/dashboard/orders/${order.id}`,
            orderId: order.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'KYC_APPROVED',
          entityName: 'Order',
          entityId: orderId,
          newData: { approvedBy: 'ADMIN_HQ', notes: notes || '', nextStatus, nextStage },
        },
      });
    });

    return { success: true, message: `KYC approved for order ${order.orderNumber}. Status: ${nextStatus}` };
  }

  private async getSystemUserId(): Promise<string> {
    const admin = await this.prisma.user.findFirst({
      where: { email: 'admin@forexmate.com' },
      select: { id: true },
    });
    if (admin) return admin.id;

    const anyUser = await this.prisma.user.findFirst({ select: { id: true } });
    if (!anyUser) throw new Error('No user found for audit logs.');
    return anyUser.id;
  }
}

