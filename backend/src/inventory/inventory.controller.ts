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
import { InventoryService } from './inventory.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { InventoryItem } from './entities/inventory-item.entity';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.inventoryService.findAll(tenantId);
  }

  @Get('low-stock')
  getLowStockItems(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getLowStockItems(tenantId);
  }

  @Get('value')
  @Roles('restaurant_admin', 'manager')
  getInventoryValue(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getInventoryValue(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.findOne(id, tenantId);
  }

  @Post()
  @Roles('restaurant_admin', 'manager')
  create(@CurrentTenant() tenantId: string, @Body() data: Partial<InventoryItem>) {
    return this.inventoryService.create(tenantId, data);
  }

  @Put(':id')
  @Roles('restaurant_admin', 'manager')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() data: Partial<InventoryItem>,
  ) {
    return this.inventoryService.update(id, tenantId, data);
  }

  @Delete(':id')
  @Roles('restaurant_admin', 'manager')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.inventoryService.remove(id, tenantId);
  }

  @Patch(':id/restock')
  @Roles('restaurant_admin', 'manager')
  restockItem(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.restockItem(id, tenantId, quantity);
  }
}
