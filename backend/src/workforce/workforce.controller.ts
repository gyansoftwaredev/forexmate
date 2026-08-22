import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkforceService } from './workforce.service';
import {
  WorkforceLoginDto,
  WorkforceChangePasswordDto,
  SendCustomerOtpDto,
  VerifyCustomerOtpDto,
  CompleteDeliveryDto,
  CompleteCashSellDto,
  ReassignBranchDto,
  AssignDeliveryPartnerDto,
  ManagerCompletePickupDto,
  ReceiveBranchInventoryDto,
} from './dto/workforce.dto';
import { WorkforceJwtGuard } from './guards/workforce-jwt.guard';

@ApiTags('Workforce Mobile App')
@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  // ─── Authentication ────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  @ApiOperation({ summary: 'Employee login with Employee ID and password' })
  login(@Body() dto: WorkforceLoginDto) {
    return this.workforceService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/change-password')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change employee password (first login or manual)' })
  changePassword(@Body() dto: WorkforceChangePasswordDto, @Request() req: any) {
    return this.workforceService.changePassword(req.user.id, dto);
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current employee profile' })
  getMe(@Request() req: any) {
    return this.workforceService.getProfile(req.user.id);
  }

  // ─── Orders ────────────────────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders assigned to the logged-in employee/manager' })
  getOrders(@Request() req: any) {
    return this.workforceService.getAssignedOrders(req.user.id, req.user.role);
  }

  @Get('orders/history')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get completed/cancelled order history' })
  getHistory(@Request() req: any) {
    return this.workforceService.getHistory(req.user.id, req.user.role);
  }

  @Get('city-inventory')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inventory for all branches in the same city (Branch Manager)' })
  getCityInventory(@Request() req: any) {
    return this.workforceService.getCityInventory(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single order details' })
  getOrder(@Param('id') id: string, @Request() req: any) {
    return this.workforceService.getOrderDetail(id, req.user.id, req.user.role);
  }

  // ─── OTP ──────────────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/send-otp')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send OTP to customer for handover verification' })
  sendOtp(@Param('id') id: string, @Body() dto: SendCustomerOtpDto, @Request() req: any) {
    return this.workforceService.sendCustomerOtp(id, dto, req.user.id, req.user.role);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/verify-otp')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify customer OTP code entered by employee' })
  verifyOtp(@Param('id') id: string, @Body() dto: VerifyCustomerOtpDto, @Request() req: any) {
    return this.workforceService.verifyCustomerOtp(id, dto, req.user.id, req.user.role);
  }

  // ─── Manager Actions ───────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/reassign-branch')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reassign order to another branch inside the same city (Branch Manager)' })
  reassignBranch(@Param('id') id: string, @Body() dto: ReassignBranchDto, @Request() req: any) {
    return this.workforceService.reassignBranch(id, req.user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/approve-kyc')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve KYC for an order (Branch Manager / KYC Staff)' })
  approveKyc(@Param('id') id: string, @Body() body: { notes?: string }, @Request() req: any) {
    return this.workforceService.approveKyc(id, req.user.id, body?.notes);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/reject-kyc')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject KYC for an order with mandatory reason (Branch Manager / KYC Staff)' })
  rejectKyc(@Param('id') id: string, @Body() body: { reason: string }, @Request() req: any) {
    return this.workforceService.rejectKyc(id, req.user.id, body?.reason);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/manager-complete-pickup')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete pickup handover with photo proof (Branch Manager)' })
  managerCompletePickup(@Param('id') id: string, @Body() dto: ManagerCompletePickupDto, @Request() req: any) {
    return this.workforceService.completePickupByManager(id, req.user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/assign-delivery-partner')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign delivery partner for home delivery (Branch Manager)' })
  assignDeliveryPartner(@Param('id') id: string, @Body() dto: AssignDeliveryPartnerDto, @Request() req: any) {
    return this.workforceService.assignDeliveryPartner(id, req.user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('manager/inventory/receive')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receive vault inventory stock with mandatory evidence (Branch Manager)' })
  receiveBranchInventory(@Body() dto: ReceiveBranchInventoryDto, @Request() req: any) {
    return this.workforceService.receiveBranchInventory(req.user.id, dto);
  }

  // ─── Delivery Partner Completion Actions ───────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/complete-pickup')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete pickup handover' })
  completePickup(@Param('id') id: string, @Request() req: any) {
    return this.workforceService.completePickup(id, req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/complete-cash-sell')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete cash sell transaction' })
  completeCashSell(@Param('id') id: string, @Body() dto: CompleteCashSellDto, @Request() req: any) {
    return this.workforceService.completeCashSell(id, req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/reached-customer')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark delivery partner has reached customer' })
  reachedCustomer(@Param('id') id: string, @Request() req: any) {
    return this.workforceService.reachedCustomer(id, req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/complete-delivery')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete delivery with signature and photo proof' })
  completeDelivery(@Param('id') id: string, @Body() dto: CompleteDeliveryDto, @Request() req: any) {
    return this.workforceService.completeDelivery(id, dto, req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/allocate-cash')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Branch Manager denomination cash allocation & reservation' })
  allocateCash(
    @Param('id') id: string,
    @Body() body: { items: { denomination: number; quantity: number }[] },
    @Request() req: any,
  ) {
    return this.workforceService.allocateCash(id, req.user.id, body.items);
  }

  // ─── Manager Web Portal Dashboard & Modules ────────────────────────────────

  @Get('manager/dashboard')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Branch Manager aggregate metrics and dashboard' })
  getManagerDashboard(@Request() req: any) {
    return this.workforceService.getManagerDashboard(req.user.id);
  }

  @Get('manager/delivery-partners')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get roster and status of Delivery Partners for branch/city' })
  getDeliveryPartners(@Request() req: any) {
    return this.workforceService.getDeliveryPartners(req.user.id);
  }

  @Get('manager/reports')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get branch performance reports and analytics' })
  getManagerReports(@Request() req: any) {
    return this.workforceService.getManagerReports(req.user.id);
  }

  @Get('manager/timeline')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get branch activity and audit event timeline' })
  getManagerTimeline(@Request() req: any) {
    return this.workforceService.getManagerTimeline(req.user.id);
  }

  // ─── Quick Actions ─────────────────────────────────────────────────────────

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/hold')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hold order by Branch Manager' })
  holdOrder(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.workforceService.holdOrder(id, req.user.id, body.reason);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/escalate')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Escalate order issue to Central Operations' })
  escalateOrder(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.workforceService.escalateOrder(id, req.user.id, body.reason);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/report-fraud')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report fraud or suspicious activity on order' })
  reportFraud(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.workforceService.reportFraud(id, req.user.id, body.reason);
  }

  @HttpCode(HttpStatus.OK)
  @Post('orders/:id/cancel-pickup')
  @UseGuards(WorkforceJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel counter pickup order' })
  cancelPickup(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    return this.workforceService.cancelPickup(id, req.user.id, body.reason);
  }
}
