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
  @Roles('restaurant_admin', 'manager')
  findAll(@CurrentTenant() tenantId: string) {
    return this.usersService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('restaurant_admin', 'manager')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('restaurant_admin')
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto);
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
  @Roles('restaurant_admin')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.remove(id, tenantId);
  }
}
