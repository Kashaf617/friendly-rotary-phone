import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuppliersService } from './suppliers.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../common/decorators/tenant.decorator';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAllSuppliers(@CurrentTenant() tenantId: string) {
    return this.suppliersService.findAllSuppliers(tenantId);
  }

  @Get(':id')
  findSupplier(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.suppliersService.findSupplier(id, tenantId);
  }

  @Post()
  @Roles('restaurant_admin', 'manager')
  createSupplier(@CurrentTenant() tenantId: string, @Body() data: Partial<Supplier>) {
    return this.suppliersService.createSupplier(tenantId, data);
  }

  @Put(':id')
  @Roles('restaurant_admin', 'manager')
  updateSupplier(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() data: Partial<Supplier>,
  ) {
    return this.suppliersService.updateSupplier(id, tenantId, data);
  }

  @Delete(':id')
  @Roles('restaurant_admin', 'manager')
  removeSupplier(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.suppliersService.removeSupplier(id, tenantId);
  }

  // Purchase Orders
  @Get('purchase-orders/all')
  findAllPOs(@CurrentTenant() tenantId: string) {
    return this.suppliersService.findAllPurchaseOrders(tenantId);
  }

  @Get('purchase-orders/:id')
  findPO(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.suppliersService.findPurchaseOrder(id, tenantId);
  }

  @Post('purchase-orders')
  @Roles('restaurant_admin', 'manager')
  createPO(@CurrentTenant() tenantId: string, @Body() data: Partial<PurchaseOrder>) {
    return this.suppliersService.createPurchaseOrder(tenantId, data);
  }

  @Patch('purchase-orders/:id/status')
  @Roles('restaurant_admin', 'manager')
  updatePOStatus(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.suppliersService.updatePurchaseOrderStatus(id, tenantId, status, userId);
  }
}
