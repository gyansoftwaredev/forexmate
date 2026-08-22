import { Body, Controller, Get, Post, Patch, UseGuards, Param, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { CreateStaffDto } from './dto/admin.dto';

@ApiTags('Admin / ERP')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/summary')
  @Permissions('orders:read:all')
  @ApiOperation({ summary: 'Executive Control Dashboard summary' })
  getDashboardSummary() {
    return this.adminService.getExecutiveMetrics();
  }

  @Get('executive-metrics')
  @Permissions('orders:read:all')
  @ApiOperation({ summary: 'Executive metrics overview' })
  getExecutiveMetrics() {
    return this.adminService.getExecutiveMetrics();
  }

  @Get('orders')
  @Permissions('orders:read:all')
  getAllOrders(@Request() req: any) {
    return this.adminService.getAllOrders(req.user);
  }

  @Post('orders/:id/status')
  @Permissions('orders:read:all')
  @ApiOperation({ summary: 'Admin override: update order status with optional reason' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.reason);
  }

  @Post('orders/:id/approve-kyc')
  @Permissions('orders:read:all')
  @ApiOperation({ summary: 'Admin HQ override: approve KYC for an order' })
  approveOrderKyc(
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.approveOrderKyc(id, body?.notes);
  }

  @Get('branches')
  @Permissions('users:manage:all')
  getAllBranches() {
    return this.adminService.getAllBranches();
  }

  @Post('branches')
  @Permissions('users:manage:all')
  createBranch(@Body() dto: any, @Request() req: any) {
    return this.adminService.createBranch(dto, req.user.id);
  }

  @Patch('branches/:id')
  @Permissions('users:manage:all')
  updateBranch(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateBranch(id, dto);
  }

  @Post('branches/:id/assign-manager')
  @Permissions('users:manage:all')
  @ApiOperation({ summary: 'Assign an existing BRANCH_MANAGER employee to a branch' })
  assignBranchManager(@Param('id') id: string, @Body('employeeId') employeeId: string, @Request() req: any) {
    return this.adminService.assignBranchManager(id, employeeId, req.user.id);
  }

  @Get('audit-logs')
  @Permissions('users:manage:all')
  @ApiOperation({ summary: 'Searchable system audit trail' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('settings')
  @Permissions('users:manage:all')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Post('settings')
  @Permissions('users:manage:all')
  updateSystemSetting(@Body() body: { key: string; value: string; category?: string }) {
    return this.adminService.updateSystemSetting(body.key, body.value, body.category);
  }

  @Get('staff')
  @Permissions('users:manage:all')
  getStaffList() {
    return this.adminService.getStaffList();
  }

  @Post('staff')
  @Permissions('users:manage:all')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.createStaff(dto);
  }

  @Post('users/:id/role')
  @Permissions('users:manage:all')
  changeUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.changeUserRole(id, role);
  }

  @Post('users/:id/status')
  @Permissions('users:manage:all')
  changeUserStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.changeUserStatus(id, status);
  }
}
