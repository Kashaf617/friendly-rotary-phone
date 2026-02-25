import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@Controller('menu')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Categories
  @Get('categories')
  findAllCategories(@CurrentTenant() tenantId: string) {
    return this.menuService.findAllCategories(tenantId);
  }

  @Get('categories/:id')
  findCategory(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.menuService.findCategory(id, tenantId);
  }

  @Post('categories')
  @Roles('restaurant_admin', 'manager')
  createCategory(@CurrentTenant() tenantId: string, @Body() dto: CreateMenuCategoryDto) {
    return this.menuService.createCategory(tenantId, dto);
  }

  @Put('categories/:id')
  @Roles('restaurant_admin', 'manager')
  updateCategory(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.menuService.updateCategory(id, tenantId, dto);
  }

  @Delete('categories/:id')
  @Roles('restaurant_admin', 'manager')
  removeCategory(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.menuService.removeCategory(id, tenantId);
  }

  // Items
  @Get('items')
  findAllItems(
    @CurrentTenant() tenantId: string,
    @Query('category_id') categoryId?: string,
  ) {
    return this.menuService.findAllItems(tenantId, categoryId);
  }

  @Get('items/:id')
  findItem(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.menuService.findItem(id, tenantId);
  }

  @Post('items')
  @Roles('restaurant_admin', 'manager')
  createItem(@CurrentTenant() tenantId: string, @Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(tenantId, dto);
  }

  @Put('items/:id')
  @Roles('restaurant_admin', 'manager')
  updateItem(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(id, tenantId, dto);
  }

  @Delete('items/:id')
  @Roles('restaurant_admin', 'manager')
  removeItem(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.menuService.removeItem(id, tenantId);
  }

  @Patch('items/:id/toggle-availability')
  @Roles('restaurant_admin', 'manager', 'kitchen_staff')
  toggleAvailability(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.menuService.toggleAvailability(id, tenantId);
  }
}
