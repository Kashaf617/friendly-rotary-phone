import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('restaurant_admin', 'manager')
  getDashboardKPIs(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboardKPIs(tenantId);
  }

  @Get('sales-trend')
  @Roles('restaurant_admin', 'manager')
  getSalesTrend(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getSalesTrend(tenantId, days ? parseInt(days) : 30);
  }

  @Get('top-items')
  @Roles('restaurant_admin', 'manager')
  getTopSellingItems(
    @CurrentTenant() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getTopSellingItems(tenantId, limit ? parseInt(limit) : 10);
  }

  @Get('revenue-by-type')
  @Roles('restaurant_admin', 'manager')
  getRevenueByOrderType(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getRevenueByOrderType(tenantId);
  }

  @Get('hourly-sales')
  @Roles('restaurant_admin', 'manager')
  getHourlySalesDistribution(
    @CurrentTenant() tenantId: string,
    @Query('date') date?: string,
  ) {
    return this.analyticsService.getHourlySalesDistribution(tenantId, date);
  }
}
