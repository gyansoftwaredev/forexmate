import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Rates')
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get live conversion rates' })
  @ApiResponse({ status: 200, description: 'Rates retrieved successfully' })
  async getAllRates() {
    return this.ratesService.getAllRates();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('rates.manage')
  @Post('currency')
  @ApiOperation({ summary: 'Add a new currency and rate to the pricing engine' })
  async addCurrency(
    @Body() body: {
      code: string;
      name: string;
      symbol?: string;
      inrRate: number;
      marginBuyPct?: number;
      marginSellPct?: number;
    }
  ) {
    return this.ratesService.addCurrency(body);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('rates.manage')
  @Delete('currency/:id')
  @ApiOperation({ summary: 'Delete or deactivate a currency from pricing engine' })
  async deleteCurrency(@Param('id') id: string) {
    return this.ratesService.deleteCurrency(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('rates.manage')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate a currency rate by ID' })
  async deleteRate(@Param('id') id: string) {
    return this.ratesService.deleteCurrency(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('rates.manage')
  @Patch(':id')
  @ApiOperation({ summary: 'Update exchange rate margins manually' })
  async updateRate(
    @Param('id') id: string,
    @Body() body: { inrRate: number; marginBuyPct: number; marginSellPct: number }
  ) {
    return this.ratesService.updateRate(id, Number(body.inrRate), Number(body.marginBuyPct), Number(body.marginSellPct));
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  async getProducts() {
    return this.ratesService.getProducts();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('rates.manage')
  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product status' })
  async updateProduct(
    @Param('id') id: string,
    @Body() body: { isActive: boolean }
  ) {
    return this.ratesService.updateProduct(id, body.isActive);
  }
}
