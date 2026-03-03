import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountingService } from './accounting.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Transaction } from './entities/transaction.entity';

@Controller('accounting')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Invoices
  @Get('invoices')
  @Roles('restaurant_admin', 'manager', 'cashier')
  findAllInvoices(@CurrentTenant() tenantId: string) {
    return this.accountingService.findAllInvoices(tenantId);
  }

  @Get('invoices/:id')
  @Roles('restaurant_admin', 'manager', 'cashier')
  findInvoice(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.accountingService.findInvoice(id, tenantId);
  }

  // Transactions
  @Post('transactions')
  @Roles('restaurant_admin', 'manager')
  createTransaction(
    @CurrentTenant() tenantId: string,
    @Body() data: Partial<Transaction>,
  ) {
    return this.accountingService.createTransaction(tenantId, data);
  }

  @Get('transactions')
  @Roles('restaurant_admin', 'manager')
  findAllTransactions(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    return this.accountingService.findAllTransactions(tenantId, type, category);
  }

  // Reports
  @Get('reports/profit-loss')
  @Roles('restaurant_admin', 'manager')
  getProfitLoss(
    @CurrentTenant() tenantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.accountingService.getProfitLoss(tenantId, startDate, endDate);
  }

  @Get('reports/vat')
  @Roles('restaurant_admin', 'manager')
  getVatReport(
    @CurrentTenant() tenantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.accountingService.getVatReport(tenantId, startDate, endDate);
  }
}
