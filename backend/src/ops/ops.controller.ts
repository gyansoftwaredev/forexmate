import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OpsService } from './ops.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BranchScopeGuard } from '../common/guards/branch-scope.guard';

@ApiTags('Branch Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, BranchScopeGuard)
@Controller('ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'List tasks for the assigned branch' })
  getBranchTasks(@Request() req: any) {
    const branchId = req.user?.branchId; 
    return this.opsService.getBranchTasks(branchId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders for the assigned branch' })
  getBranchOrders(@Request() req: any) {
    const branchId = req.user?.branchId;
    if (!branchId) throw new BadRequestException('No branch associated with user');
    return this.opsService.getBranchOrders(branchId);
  }

  @Get('branch-vaults')
  @ApiOperation({ summary: 'List vaults for the assigned branch' })
  getBranchVaults(@Request() req: any) {
    const branchId = req.user?.branchId;
    if (!branchId) throw new BadRequestException('No branch associated with user');
    return this.opsService.getBranchVaults(branchId);
  }

  @Post('tasks/:id/resolve')
  @ApiOperation({ summary: 'Resolve a branch task' })
  resolveTask(@Param('id') id: string, @Body() data: { status: string; notes?: string }, @Request() req: any) {
    return this.opsService.resolveTask(id, req.user, data);
  }

  @Post('tasks/:id/claim')
  @ApiOperation({ summary: 'Claim a branch task' })
  claimTask(@Param('id') id: string, @Request() req: any) {
    return this.opsService.claimTask(id, req.user);
  }

  @Get('leads')
  @ApiOperation({ summary: 'List CRM leads for the assigned branch' })
  getBranchLeads(@Request() req: any) {
    // Centralized Operations Architecture: Fetch all nationwide orders
    return this.opsService.getBranchLeads(null, req.user);
  }

  @Post('leads/:id/claim')
  @ApiOperation({ summary: 'Claim a lead/order' })
  claimLead(@Param('id') id: string, @Request() req: any) {
    return this.opsService.claimLead(id, req.user);
  }

  @Post('leads/:id/action')
  @ApiOperation({ summary: 'Perform checklists action on lead' })
  processLeadAction(
    @Param('id') id: string,
    @Body() data: { action: string; notes?: string },
    @Request() req: any
  ) {
    return this.opsService.processLeadAction(id, data.action, data.notes || '', req.user);
  }

  @Post('leads/:id/reassign')
  @ApiOperation({ summary: 'Reassign a lead to another staff member (Manager/Admin Only)' })
  reassignLead(
    @Param('id') id: string,
    @Body() data: { staffId: string },
    @Request() req: any
  ) {
    return this.opsService.reassignLead(id, data.staffId, req.user);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List all staff members in the current branch' })
  getBranchStaff(@Request() req: any) {
    const branchId = req.user?.branchId;
    return this.opsService.getBranchStaff(branchId);
  }

  @Get('cashiers')
  @ApiOperation({ summary: 'List all cashiers in the current branch' })
  getBranchCashiers(@Request() req: any) {
    const branchId = req.user?.branchId;
    return this.opsService.getBranchCashiers(branchId);
  }

  @Get('delivery-partners')
  @ApiOperation({ summary: 'List all delivery partners in the current branch' })
  getBranchDeliveryPartners(@Request() req: any) {
    const branchId = req.user?.branchId;
    return this.opsService.getBranchDeliveryPartners(branchId);
  }

  @Post('leads/:id/assign-fulfillment')
  @ApiOperation({ summary: 'Assign or reassign cashier/delivery partner to order' })
  assignFulfillment(
    @Param('id') id: string,
    @Body() data: { cashierId?: string; deliveryPartnerId?: string },
    @Request() req: any
  ) {
    return this.opsService.assignFulfillment(id, data, req.user);
  }

  @Post('orders/:id/forward-remittance')
  @ApiOperation({ summary: 'Forward a verified remittance order to a partner dealer' })
  forwardRemittance(
    @Param('id') id: string,
    @Body() data: { partnerReference?: string; partnerRemarks?: string },
    @Request() req: any
  ) {
    return this.opsService.forwardRemittanceToPartner(id, data, req.user);
  }

  @Post('orders/:id/update-remittance-status')
  @ApiOperation({ summary: 'Update processing status for a forwarded remittance order' })
  updateRemittanceStatus(
    @Param('id') id: string,
    @Body() data: { partnerStatus: string; partnerReference?: string; partnerRemarks?: string },
    @Request() req: any
  ) {
    return this.opsService.updateRemittancePartnerStatus(id, data, req.user);
  }

  @Post('orders/:id/send-to-branch')
  @ApiOperation({ summary: 'Send order to branch after central compliance completion' })
  sendToBranch(
    @Param('id') id: string,
    @Body() data: { targetBranchId?: string; remarks?: string },
    @Request() req: any
  ) {
    return this.opsService.sendToBranch(id, data, req.user);
  }

  @Get('branches/same-city/:branchId')
  @ApiOperation({ summary: 'Get branches in the same city as specified branch' })
  getSameCityBranches(@Param('branchId') branchId: string) {
    return this.opsService.getSameCityBranches(branchId);
  }

  @Post('orders/:id/reassign-branch')
  @ApiOperation({ summary: 'Reassign order to a same-city branch with reason' })
  reassignBranch(
    @Param('id') id: string,
    @Body() data: { targetBranchId: string; reason: string },
    @Request() req: any
  ) {
    return this.opsService.reassignBranch(id, data, req.user);
  }

  @Get('orders/:id/city-inventory-comparison')
  @ApiOperation({ summary: 'Get city-wide branch inventory analysis and smart branch ranking for an order' })
  getCityInventoryComparison(@Param('id') id: string) {
    return this.opsService.getCityBranchInventoryComparison(id);
  }

  @Post('orders/:id/smart-assign-branch')
  @ApiOperation({ summary: 'Assign or reassign an order to a target branch based on city inventory analysis' })
  smartAssignBranch(
    @Param('id') id: string,
    @Body() data: { targetBranchId: string; reason?: string },
    @Request() req: any
  ) {
    return this.opsService.smartAssignBranch(id, data, req.user);
  }

  @Post('leads/:id/verify-doc')
  @ApiOperation({ summary: 'Staff manual verification of customer KYC document over call' })
  verifyLeadDoc(
    @Param('id') id: string,
    @Body() data: { docType: string; status?: string; notes?: string },
    @Request() req: any
  ) {
    return this.opsService.verifyLeadDoc(id, data, req.user);
  }

  @Post('leads/:id/upload-doc')
  @ApiOperation({ summary: 'Staff upload and verify KYC document directly for lead' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  uploadLeadDoc(
    @Param('id') id: string,
    @Body('docType') docType: string,
    @Body('notes') notes: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!docType) throw new BadRequestException('docType is required');
    return this.opsService.uploadLeadDoc(id, docType, file, req.user, notes);
  }
}
