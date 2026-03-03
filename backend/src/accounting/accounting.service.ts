import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Transaction } from './entities/transaction.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);
  private invoiceCounter: Record<string, number> = {};

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly settingsService: SettingsService,
  ) {}

  // Invoices
  private generateInvoiceNumber(tenantId: string): string {
    if (!this.invoiceCounter[tenantId]) this.invoiceCounter[tenantId] = 0;
    this.invoiceCounter[tenantId]++;
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `INV-${dateStr}-${String(this.invoiceCounter[tenantId]).padStart(5, '0')}`;
  }

  async createInvoiceFromOrder(
    tenantId: string,
    orderData: {
      order_id: string;
      customer_name?: string;
      trn?: string;
      line_items: { description: string; quantity: number; unit_price: number; total: number }[];
      subtotal: number;
      discount_amount: number;
      vat_amount: number;
      total_amount: number;
      payment_method?: string;
    },
  ) {
    const { rate: vatRate } = await this.settingsService.getVatConfig(tenantId);

    const invoice = this.invoiceRepository.create({
      tenant_id: tenantId,
      invoice_number: this.generateInvoiceNumber(tenantId),
      order_id: orderData.order_id,
      customer_name: orderData.customer_name,
      trn: orderData.trn,
      line_items: orderData.line_items,
      subtotal: orderData.subtotal,
      vat_rate: vatRate,
      vat_amount: orderData.vat_amount,
      discount_amount: orderData.discount_amount,
      total_amount: orderData.total_amount,
      currency: 'AED',
      payment_status: orderData.payment_method ? 'paid' : 'unpaid',
      payment_method: orderData.payment_method,
      paid_at: orderData.payment_method ? new Date() : undefined,
    });

    const saved = await this.invoiceRepository.save(invoice);

    // Create income transaction
    if (orderData.payment_method) {
      await this.createTransaction(tenantId, {
        type: 'income',
        category: 'sales',
        amount: orderData.total_amount,
        description: `Payment for invoice ${saved.invoice_number}`,
        reference_number: saved.invoice_number,
        invoice_id: saved.id,
        order_id: orderData.order_id,
        payment_method: orderData.payment_method,
        transaction_date: new Date(),
      });
    }

    return saved;
  }

  async findAllInvoices(tenantId: string) {
    return this.invoiceRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findInvoice(id: string, tenantId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // Transactions
  async createTransaction(tenantId: string, data: Partial<Transaction>) {
    const transaction = this.transactionRepository.create({
      ...data,
      tenant_id: tenantId,
    });
    return this.transactionRepository.save(transaction);
  }

  async findAllTransactions(tenantId: string, type?: string, category?: string) {
    const where: any = { tenant_id: tenantId };
    if (type) where.type = type;
    if (category) where.category = category;
    return this.transactionRepository.find({
      where,
      order: { transaction_date: 'DESC' },
    });
  }

  // Financial Reports
  async getProfitLoss(tenantId: string, startDate: string, endDate: string) {
    const income = await this.transactionRepository
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'total')
      .addSelect('t.category', 'category')
      .where('t.tenant_id = :tenantId', { tenantId })
      .andWhere('t.type = :type', { type: 'income' })
      .andWhere('t.transaction_date >= :startDate', { startDate })
      .andWhere('t.transaction_date <= :endDate', { endDate })
      .groupBy('t.category')
      .getRawMany();

    const expenses = await this.transactionRepository
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'total')
      .addSelect('t.category', 'category')
      .where('t.tenant_id = :tenantId', { tenantId })
      .andWhere('t.type = :type', { type: 'expense' })
      .andWhere('t.transaction_date >= :startDate', { startDate })
      .andWhere('t.transaction_date <= :endDate', { endDate })
      .groupBy('t.category')
      .getRawMany();

    const totalIncome = income.reduce((sum, i) => sum + Number(i.total), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.total), 0);

    return {
      period: { start: startDate, end: endDate },
      income: { total: totalIncome, breakdown: income },
      expenses: { total: totalExpenses, breakdown: expenses },
      net_profit: Number((totalIncome - totalExpenses).toFixed(2)),
      currency: 'AED',
    };
  }

  async getVatReport(tenantId: string, startDate: string, endDate: string) {
    const { rate: vatRate } = await this.settingsService.getVatConfig(tenantId);

    const invoices = await this.invoiceRepository
      .createQueryBuilder('i')
      .select('SUM(i.vat_amount)', 'total_vat_collected')
      .addSelect('SUM(i.subtotal)', 'total_sales')
      .addSelect('COUNT(*)', 'invoice_count')
      .where('i.tenant_id = :tenantId', { tenantId })
      .andWhere('i.created_at >= :startDate', { startDate })
      .andWhere('i.created_at <= :endDate', { endDate })
      .andWhere('i.payment_status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne();

    return {
      period: { start: startDate, end: endDate },
      total_sales: Number(invoices.total_sales || 0).toFixed(2),
      total_vat_collected: Number(invoices.total_vat_collected || 0).toFixed(2),
      invoice_count: Number(invoices.invoice_count),
      vat_rate: `${vatRate * 100}%`,
      currency: 'AED',
    };
  }
}
