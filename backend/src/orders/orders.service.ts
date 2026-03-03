import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  ProcessPaymentDto,
} from './dto/order.dto';
import { SettingsService } from '../settings/settings.service';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orderCounter: Record<string, number> = {};

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly settingsService: SettingsService,
    private readonly accountingService: AccountingService,
  ) {}

  private generateOrderNumber(tenantId: string): string {
    if (!this.orderCounter[tenantId]) {
      this.orderCounter[tenantId] = 0;
    }
    this.orderCounter[tenantId]++;
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `ORD-${dateStr}-${String(this.orderCounter[tenantId]).padStart(4, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreateOrderDto) {
    // Calculate totals
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of dto.items) {
      let itemTotal = item.unit_price * item.quantity;
      // Add modifier prices
      if (item.selected_modifiers) {
        for (const mod of item.selected_modifiers) {
          itemTotal += mod.price * item.quantity;
        }
      }
      subtotal += itemTotal;

      orderItems.push({
        tenant_id: tenantId,
        menu_item_id: item.menu_item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: itemTotal,
        selected_modifiers: item.selected_modifiers,
        special_instructions: item.special_instructions,
        kitchen_status: 'pending',
      });
    }

    // Calculate discount
    let discountAmount = dto.discount_amount || 0;
    if (dto.discount_percent && dto.discount_percent > 0) {
      discountAmount = subtotal * (dto.discount_percent / 100);
    }

    const { rate: vatRate } = await this.settingsService.getVatConfig(tenantId);

    const taxableAmount = subtotal - discountAmount;
    const vatAmount = Number((taxableAmount * vatRate).toFixed(2));
    const totalAmount = Number((taxableAmount + vatAmount).toFixed(2));

    const order = this.orderRepository.create({
      tenant_id: tenantId,
      order_number: this.generateOrderNumber(tenantId),
      order_type: dto.order_type || 'dine_in',
      status: 'confirmed',
      waiter_id: userId,
      table_number: dto.table_number,
      guest_count: dto.guest_count || 1,
      subtotal,
      discount_amount: discountAmount,
      discount_percent: dto.discount_percent || 0,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      payment_status: 'unpaid',
      notes: dto.notes,
      customer_id: dto.customer_id,
      currency: 'AED',
    });

    const savedOrder = await this.orderRepository.save(order);

    // Save order items
    const items = orderItems.map((item) =>
      this.orderItemRepository.create({
        ...item,
        order_id: savedOrder.id,
      }),
    );
    await this.orderItemRepository.save(items);

    this.logger.log(`Order ${savedOrder.order_number} created for tenant ${tenantId}`);

    return this.findOne(savedOrder.id, tenantId);
  }

  async findAll(tenantId: string, status?: string) {
    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;
    return this.orderRepository.find({
      where,
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async findLiveOrders(tenantId: string) {
    return this.orderRepository.find({
      where: [
        { tenant_id: tenantId, status: 'confirmed' },
        { tenant_id: tenantId, status: 'preparing' },
        { tenant_id: tenantId, status: 'ready' },
        { tenant_id: tenantId, status: 'pending' },
      ],
      relations: ['items'],
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.orderRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id, tenantId);
    order.status = dto.status;
    return this.orderRepository.save(order);
  }

  async updateKitchenStatus(
    tenantId: string,
    orderItemId: string,
    kitchenStatus: string,
  ) {
    const item = await this.orderItemRepository.findOne({
      where: { id: orderItemId, tenant_id: tenantId },
    });
    if (!item) throw new NotFoundException('Order item not found');
    item.kitchen_status = kitchenStatus;
    const saved = await this.orderItemRepository.save(item);

    // Check if all items are ready, update order status
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: item.order_id },
    });
    const allReady = orderItems.every((i) => i.kitchen_status === 'ready' || i.kitchen_status === 'served');
    if (allReady) {
      await this.orderRepository.update(item.order_id, { status: 'ready' });
    }

    return saved;
  }

  async processPayment(id: string, tenantId: string, dto: ProcessPaymentDto) {
    const order = await this.findOne(id, tenantId);
    order.payment_method = dto.payment_method;
    order.payment_status = 'paid';
    order.status = 'completed';
    if (dto.split_details) {
      order.split_details = dto.split_details;
    }

    // Create invoice for this paid order
    try {
      const line_items = (order.items || []).map((it) => ({
        description: it.item_name,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        total: Number(it.total_price),
      }));
      await this.accountingService.createInvoiceFromOrder(tenantId, {
        order_id: order.id,
        customer_name: undefined,
        trn: undefined,
        line_items,
        subtotal: Number(order.subtotal),
        discount_amount: Number(order.discount_amount || 0),
        vat_amount: Number(order.vat_amount || 0),
        total_amount: Number(order.total_amount),
        payment_method: dto.payment_method,
      });
    } catch (e) {
      this.logger.error(`Failed to create invoice for order ${order.id}: ${e?.message || e}`);
    }

    return this.orderRepository.save(order);
  }

  async cancelOrder(id: string, tenantId: string) {
    const order = await this.findOne(id, tenantId);
    order.status = 'cancelled';
    order.payment_status = 'refunded';
    return this.orderRepository.save(order);
  }

  async getDailySummary(tenantId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const qb = this.orderRepository.createQueryBuilder('order')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('DATE(order.created_at) = :date', { date: targetDate })
      .andWhere('order.status != :cancelled', { cancelled: 'cancelled' });

    const orders = await qb.getMany();
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalVat = orders.reduce((sum, o) => sum + Number(o.vat_amount), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      date: targetDate,
      total_orders: totalOrders,
      total_revenue: Number(totalRevenue.toFixed(2)),
      total_vat: Number(totalVat.toFixed(2)),
      average_order_value: Number(avgOrderValue.toFixed(2)),
      currency: 'AED',
    };
  }
}
