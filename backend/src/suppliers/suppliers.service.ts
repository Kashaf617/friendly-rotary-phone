import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    private readonly settingsService: SettingsService,
  ) {}

  // Suppliers
  async findAllSuppliers(tenantId: string) {
    return this.supplierRepository.find({
      where: { tenant_id: tenantId },
      order: { name: 'ASC' },
    });
  }

  async findSupplier(id: string, tenantId: string) {
    const supplier = await this.supplierRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async createSupplier(tenantId: string, data: Partial<Supplier>) {
    const supplier = this.supplierRepository.create({ ...data, tenant_id: tenantId });
    return this.supplierRepository.save(supplier);
  }

  async updateSupplier(id: string, tenantId: string, data: Partial<Supplier>) {
    const supplier = await this.findSupplier(id, tenantId);
    Object.assign(supplier, data);
    return this.supplierRepository.save(supplier);
  }

  async removeSupplier(id: string, tenantId: string) {
    const supplier = await this.findSupplier(id, tenantId);
    await this.supplierRepository.remove(supplier);
    return { message: 'Supplier deleted' };
  }

  // Purchase Orders
  private poCounter: Record<string, number> = {};

  private generatePONumber(tenantId: string): string {
    if (!this.poCounter[tenantId]) this.poCounter[tenantId] = 0;
    this.poCounter[tenantId]++;
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `PO-${dateStr}-${String(this.poCounter[tenantId]).padStart(4, '0')}`;
  }

  async findAllPurchaseOrders(tenantId: string) {
    return this.poRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findPurchaseOrder(id: string, tenantId: string) {
    const po = await this.poRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async createPurchaseOrder(tenantId: string, data: Partial<PurchaseOrder>) {
    const subtotal = (data.items || []).reduce((sum, item) => sum + item.total, 0);
    const { rate: vatRate } = await this.settingsService.getVatConfig(tenantId);
    const vatAmount = Number((subtotal * vatRate).toFixed(2));

    const po = this.poRepository.create({
      ...data,
      tenant_id: tenantId,
      po_number: this.generatePONumber(tenantId),
      subtotal,
      vat_amount: vatAmount,
      total_amount: Number((subtotal + vatAmount).toFixed(2)),
      status: 'draft',
    });
    return this.poRepository.save(po);
  }

  async updatePurchaseOrderStatus(id: string, tenantId: string, status: string, userId?: string) {
    const po = await this.findPurchaseOrder(id, tenantId);
    po.status = status;
    if (status === 'approved' && userId) po.approved_by = userId;
    if (status === 'received') po.received_date = new Date();
    return this.poRepository.save(po);
  }
}
