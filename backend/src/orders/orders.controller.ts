import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('direct-checkout')
  @ApiOperation({ summary: 'Direct customer order checkout' })
  @ApiResponse({ status: 201, description: 'Order created in real-time' })
  directCheckout(@Body() body: any, @Request() req: any) {
    const authUserId = req.user?.id || null;
    return this.ordersService.createDirectCheckout(authUserId, body);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order from a quote' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Quote expired or invalid' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(@Request() req: any) {
    return this.ordersService.findAllForUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a specific order' })
  @ApiResponse({ status: 200, description: 'Order details retrieved' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('orders:manage:all')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Staff Only)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateDto.status);
  }

  @Post(':id/request-cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request order cancellation (Customer-initiated)' })
  @ApiResponse({ status: 200, description: 'Order cancellation requested successfully' })
  requestCancel(@Param('id') id: string, @Body() body: { reason: string }, @Request() req: any) {
    return this.ordersService.requestCancel(id, body.reason, req.user.id);
  }
}
