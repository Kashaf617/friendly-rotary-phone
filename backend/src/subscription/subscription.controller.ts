import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionService } from './subscription.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current')
  findCurrent(@CurrentTenant() tenantId: string) {
    return this.subscriptionService.findByTenant(tenantId);
  }

  @Get()
  @Roles('super_admin')
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Post()
  @Roles('super_admin')
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id') id: string) {
    return this.subscriptionService.delete(id);
  }

  @Get('check-limits')
  checkLimits(@CurrentTenant() tenantId: string) {
    return this.subscriptionService.checkLimits(tenantId);
  }
}
