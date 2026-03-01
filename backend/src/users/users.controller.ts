import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('super_admin', 'restaurant_admin', 'manager')
  findAll(@CurrentTenant() tenantId: string) {
    if (!tenantId) {
      // Super admin - get all users
      return this.usersService.findAll();
    }
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('restaurant_admin', 'manager')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('super_admin', 'restaurant_admin')
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateUserDto) {
    // Super admin can specify tenant_id in DTO, restaurant admin uses their own tenant
    const targetTenantId = dto.tenant_id || tenantId;
    return this.usersService.create(targetTenantId, dto);
  }

  @Put(':id')
  @Roles('restaurant_admin')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'restaurant_admin')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    // Super admin can delete any user, restaurant admin only in their tenant
    if (!tenantId) {
      // Super admin - delete without tenant restriction
      return this.usersService.removeById(id);
    }
    return this.usersService.remove(id, tenantId);
  }
}
