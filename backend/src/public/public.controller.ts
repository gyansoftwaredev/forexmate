import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public Website API')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get live exchange rates for public storefront' })
  @ApiResponse({ status: 200, description: 'Live rates returned' })
  getRates() {
    return this.publicService.getLiveRates();
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get active currencies for public storefront' })
  @ApiResponse({ status: 200, description: 'Currencies returned' })
  getCurrencies() {
    return this.publicService.getActiveCurrencies();
  }

  @Get('branches')
  @ApiOperation({ summary: 'Get active branches for public storefront' })
  @ApiResponse({ status: 200, description: 'Branches returned' })
  getBranches() {
    return this.publicService.getActiveBranches();
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get active testimonials for public storefront' })
  @ApiResponse({ status: 200, description: 'Testimonials returned' })
  getTestimonials() {
    return this.publicService.getTestimonials();
  }

  @Get('remittance-purposes')
  @ApiOperation({ summary: 'Get active transfer purposes for public remittance form' })
  @ApiResponse({ status: 200, description: 'Transfer purposes returned' })
  getRemittancePurposes() {
    return this.publicService.getRemittancePurposes();
  }

  @Get('remittance-countries')
  @ApiOperation({ summary: 'Get active destination countries for public remittance form' })
  @ApiResponse({ status: 200, description: 'Destination countries returned' })
  getRemittanceCountries() {
    return this.publicService.getRemittanceCountries();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all configured forex products and active statuses' })
  @ApiResponse({ status: 200, description: 'Products returned' })
  getProducts() {
    return this.publicService.getProducts();
  }
}
