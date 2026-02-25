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
import { RolesService } from './roles.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Role } from './entities/role.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('restaurant_admin', 'manager')
  findAll(@CurrentTenant() tenantId: string) {
    return this.rolesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('restaurant_admin')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Roles('restaurant_admin')
  create(@CurrentTenant() tenantId: string, @Body() data: Partial<Role>) {
    return this.rolesService.create(tenantId, data);
  }

  @Put(':id')
  @Roles('restaurant_admin')
  update(@Param('id') id: string, @Body() data: Partial<Role>) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @Roles('restaurant_admin')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
