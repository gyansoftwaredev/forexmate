import { Controller, Get, Param, UseGuards, Request, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RemittanceService } from './remittance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('Remittance')
@Controller('remittances')
export class RemittanceController {
  constructor(private readonly remittanceService: RemittanceService) {}

  @Get('purposes')
  @ApiOperation({ summary: 'List active transfer purposes' })
  getPurposes() {
    return this.remittanceService.getPurposes();
  }

  @Get('countries')
  @ApiOperation({ summary: 'List active destination countries' })
  getCountries() {
    return this.remittanceService.getCountries();
  }

  @Get('partners')
  @ApiOperation({ summary: 'List active remittance partners' })
  getPartners() {
    return this.remittanceService.getPartners();
  }

  @Get('calculate')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Calculate remittance total, fees, and TCS tax' })
  calculate(
    @Request() req: any,
    @Query('amount') amount: string,
    @Query('currency') currency: string,
    @Query('countryCode') countryCode: string,
    @Query('purposeCode') purposeCode: string,
    @Query('direction') direction?: string
  ) {
    return this.remittanceService.calculate(req.user?.id, {
      amount: parseFloat(amount),
      currency,
      countryCode,
      purposeCode,
      direction
    });
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all remittance orders for the logged-in user' })
  getMyRemittances(@Request() req: any) {
    return this.remittanceService.getMyRemittances(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all remittance orders for the logged-in user' })
  getAllMyRemittances(@Request() req: any) {
    return this.remittanceService.getMyRemittances(req.user.id);
  }

  @Get('beneficiaries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer\'s saved beneficiaries' })
  getBeneficiaries(@Request() req: any) {
    return this.remittanceService.getBeneficiaries(req.user.id);
  }

  @Post('beneficiaries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a new beneficiary' })
  createBeneficiary(@Request() req: any, @Body() body: any) {
    return this.remittanceService.createBeneficiary(req.user.id, body);
  }

  @Put('beneficiaries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing beneficiary' })
  updateBeneficiary(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.remittanceService.updateBeneficiary(req.user.id, id, body);
  }

  @Delete('beneficiaries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a beneficiary' })
  deleteBeneficiary(@Request() req: any, @Param('id') id: string) {
    return this.remittanceService.deleteBeneficiary(req.user.id, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific remittance order by ID' })
  getRemittanceById(@Param('id') id: string, @Request() req: any) {
    return this.remittanceService.getRemittanceById(id, req.user.id);
  }
}
