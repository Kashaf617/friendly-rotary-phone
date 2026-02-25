import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Invoice } from '../accounting/entities/invoice.entity';
import { Transaction } from '../accounting/entities/transaction.entity';
import { Employee } from '../hr/entities/employee.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async getDashboardKPIs(tenantId: string) {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    // Today's revenue
    const todayRevenue = await this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total_amount), 0)', 'total')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('DATE(o.created_at) = :today', { today })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne();

    // Monthly revenue
    const monthlyRevenue = await this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total_amount), 0)', 'total')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= :monthStart', { monthStart })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne();

    // Today's orders count
    const todayOrders = await this.orderRepository
      .createQueryBuilder('o')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('DATE(o.created_at) = :today', { today })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .getCount();

    // Monthly orders count
    const monthlyOrders = await this.orderRepository
      .createQueryBuilder('o')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= :monthStart', { monthStart })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .getCount();

    // Active employees
    const activeEmployees = await this.employeeRepository.count({
      where: { tenant_id: tenantId, status: 'active' },
    });

    // Monthly VAT collected
    const monthlyVat = await this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.vat_amount), 0)', 'total')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= :monthStart', { monthStart })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne();

    // Average order value
    const avgOrderValue = monthlyOrders > 0
      ? Number(monthlyRevenue.total) / monthlyOrders
      : 0;

    return {
      today: {
        revenue: Number(Number(todayRevenue.total).toFixed(2)),
        orders: todayOrders,
      },
      monthly: {
        revenue: Number(Number(monthlyRevenue.total).toFixed(2)),
        orders: monthlyOrders,
        vat_collected: Number(Number(monthlyVat.total).toFixed(2)),
        avg_order_value: Number(avgOrderValue.toFixed(2)),
      },
      staff: {
        active_employees: activeEmployees,
      },
      currency: 'AED',
    };
  }

  async getSalesTrend(tenantId: string, days: number = 30) {
    const result = await this.orderRepository
      .createQueryBuilder('o')
      .select("DATE(o.created_at)", 'date')
      .addSelect('COALESCE(SUM(o.total_amount), 0)', 'revenue')
      .addSelect('COUNT(*)', 'order_count')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= NOW() - :interval::interval', { interval: `${days} days` })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy("DATE(o.created_at)")
      .orderBy("DATE(o.created_at)", 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      revenue: Number(Number(r.revenue).toFixed(2)),
      order_count: Number(r.order_count),
    }));
  }

  async getTopSellingItems(tenantId: string, limit: number = 10) {
    const result = await this.orderItemRepository
      .createQueryBuilder('oi')
      .select('oi.item_name', 'item_name')
      .addSelect('oi.menu_item_id', 'menu_item_id')
      .addSelect('SUM(oi.quantity)', 'total_quantity')
      .addSelect('SUM(oi.total_price)', 'total_revenue')
      .where('oi.tenant_id = :tenantId', { tenantId })
      .groupBy('oi.item_name')
      .addGroupBy('oi.menu_item_id')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((r) => ({
      item_name: r.item_name,
      menu_item_id: r.menu_item_id,
      total_quantity: Number(r.total_quantity),
      total_revenue: Number(Number(r.total_revenue).toFixed(2)),
    }));
  }

  async getRevenueByOrderType(tenantId: string) {
    const result = await this.orderRepository
      .createQueryBuilder('o')
      .select('o.order_type', 'order_type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(o.total_amount), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('o.order_type')
      .getRawMany();

    return result.map((r) => ({
      order_type: r.order_type,
      count: Number(r.count),
      revenue: Number(Number(r.revenue).toFixed(2)),
    }));
  }

  async getHourlySalesDistribution(tenantId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const result = await this.orderRepository
      .createQueryBuilder('o')
      .select('EXTRACT(HOUR FROM o.created_at)', 'hour')
      .addSelect('COUNT(*)', 'order_count')
      .addSelect('COALESCE(SUM(o.total_amount), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('DATE(o.created_at) = :date', { date: targetDate })
      .andWhere('o.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('EXTRACT(HOUR FROM o.created_at)')
      .orderBy('EXTRACT(HOUR FROM o.created_at)', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      hour: Number(r.hour),
      order_count: Number(r.order_count),
      revenue: Number(Number(r.revenue).toFixed(2)),
    }));
  }
}
