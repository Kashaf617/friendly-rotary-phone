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
import { SettingsService } from './settings.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('restaurant_admin', 'manager')
  findAll(@CurrentTenant() tenantId: string) {
    return this.settingsService.findAllByTenant(tenantId);
  }

  @Get(':key')
  @Roles('restaurant_admin', 'manager')
  findOne(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.settingsService.findByKey(tenantId, key);
  }

  @Post()
  @Roles('restaurant_admin')
  upsert(@CurrentTenant() tenantId: string, @Body() dto: CreateSettingDto) {
    return this.settingsService.upsert(tenantId, dto);
  }

  @Put(':key')
  @Roles('restaurant_admin')
  update(
    @CurrentTenant() tenantId: string,
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.update(tenantId, key, dto);
  }

  @Delete(':key')
  @Roles('restaurant_admin')
  remove(@CurrentTenant() tenantId: string, @Param('key') key: string) {
    return this.settingsService.remove(tenantId, key);
  }
}
