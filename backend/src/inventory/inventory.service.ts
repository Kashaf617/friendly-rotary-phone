import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async findAll(tenantId: string) {
    return this.inventoryRepository.find({
      where: { tenant_id: tenantId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.inventoryRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async create(tenantId: string, data: Partial<InventoryItem>) {
    const item = this.inventoryRepository.create({ ...data, tenant_id: tenantId });
    return this.inventoryRepository.save(item);
  }

  async update(id: string, tenantId: string, data: Partial<InventoryItem>) {
    const item = await this.findOne(id, tenantId);
    Object.assign(item, data);
    return this.inventoryRepository.save(item);
  }

  async remove(id: string, tenantId: string) {
    const item = await this.findOne(id, tenantId);
    await this.inventoryRepository.remove(item);
    return { message: 'Inventory item deleted' };
  }

  async deductStock(tenantId: string, itemId: string, quantity: number) {
    const item = await this.findOne(itemId, tenantId);
    item.stock_level = Number(item.stock_level) - quantity;
    if (item.stock_level < 0) item.stock_level = 0;
    const saved = await this.inventoryRepository.save(item);

    if (Number(saved.stock_level) <= Number(saved.low_stock_threshold)) {
      this.logger.warn(
        `Low stock alert: ${saved.name} (${saved.stock_level} ${saved.unit}) for tenant ${tenantId}`,
      );
    }

    return saved;
  }

  async restockItem(id: string, tenantId: string, quantity: number) {
    const item = await this.findOne(id, tenantId);
    item.stock_level = Number(item.stock_level) + quantity;
    item.last_restocked_at = new Date();
    return this.inventoryRepository.save(item);
  }

  async getLowStockItems(tenantId: string) {
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.tenant_id = :tenantId', { tenantId })
      .andWhere('item.stock_level <= item.low_stock_threshold')
      .andWhere('item.is_active = true')
      .orderBy('item.stock_level', 'ASC')
      .getMany();
    return items;
  }

  async getInventoryValue(tenantId: string) {
    const result = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('SUM(item.stock_level * item.unit_cost)', 'total_value')
      .addSelect('COUNT(*)', 'total_items')
      .where('item.tenant_id = :tenantId', { tenantId })
      .andWhere('item.is_active = true')
      .getRawOne();

    return {
      total_value: Number(result.total_value || 0).toFixed(2),
      total_items: Number(result.total_items),
      currency: 'AED',
    };
  }
}
