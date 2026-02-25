import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  ProcessPaymentDto,
  UpdateKitchenStatusDto,
} from './dto/order.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../common/decorators/tenant.decorator';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('restaurant_admin', 'manager', 'cashier', 'waiter')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(tenantId, userId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query('status') status?: string) {
    return this.ordersService.findAll(tenantId, status);
  }

  @Get('live')
  findLiveOrders(@CurrentTenant() tenantId: string) {
    return this.ordersService.findLiveOrders(tenantId);
  }

  @Get('daily-summary')
  @Roles('restaurant_admin', 'manager')
  getDailySummary(
    @CurrentTenant() tenantId: string,
    @Query('date') date?: string,
  ) {
    return this.ordersService.getDailySummary(tenantId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Patch(':id/status')
  @Roles('restaurant_admin', 'manager', 'cashier', 'waiter')
  updateStatus(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, tenantId, dto);
  }

  @Patch('kitchen-status')
  @Roles('restaurant_admin', 'manager', 'kitchen_staff')
  updateKitchenStatus(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateKitchenStatusDto,
  ) {
    return this.ordersService.updateKitchenStatus(
      tenantId,
      dto.order_item_id,
      dto.kitchen_status,
    );
  }

  @Post(':id/payment')
  @Roles('restaurant_admin', 'manager', 'cashier')
  processPayment(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.ordersService.processPayment(id, tenantId, dto);
  }

  @Patch(':id/cancel')
  @Roles('restaurant_admin', 'manager')
  cancelOrder(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.ordersService.cancelOrder(id, tenantId);
  }
}
