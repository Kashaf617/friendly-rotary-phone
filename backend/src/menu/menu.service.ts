import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuCategory)
    private categoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private itemRepository: Repository<MenuItem>,
  ) {}

  // Categories
  async findAllCategories(tenantId: string) {
    return this.categoryRepository.find({
      where: { tenant_id: tenantId },
      relations: ['items'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findCategory(id: string, tenantId: string) {
    const cat = await this.categoryRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['items'],
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async createCategory(tenantId: string, dto: CreateMenuCategoryDto) {
    const category = this.categoryRepository.create({ ...dto, tenant_id: tenantId });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, tenantId: string, dto: UpdateMenuCategoryDto) {
    const category = await this.findCategory(id, tenantId);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string, tenantId: string) {
    const category = await this.findCategory(id, tenantId);
    await this.categoryRepository.remove(category);
    return { message: 'Category deleted' };
  }

  // Items
  async findAllItems(tenantId: string, categoryId?: string) {
    const where: any = { tenant_id: tenantId };
    if (categoryId) where.category_id = categoryId;
    return this.itemRepository.find({
      where,
      relations: ['category'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findItem(id: string, tenantId: string) {
    const item = await this.itemRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['category'],
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async createItem(tenantId: string, dto: CreateMenuItemDto) {
    const item = this.itemRepository.create({ ...dto, tenant_id: tenantId });
    return this.itemRepository.save(item);
  }

  async updateItem(id: string, tenantId: string, dto: UpdateMenuItemDto) {
    const item = await this.findItem(id, tenantId);
    Object.assign(item, dto);
    return this.itemRepository.save(item);
  }

  async removeItem(id: string, tenantId: string) {
    const item = await this.findItem(id, tenantId);
    await this.itemRepository.remove(item);
    return { message: 'Menu item deleted' };
  }

  async toggleAvailability(id: string, tenantId: string) {
    const item = await this.findItem(id, tenantId);
    item.is_available = !item.is_available;
    return this.itemRepository.save(item);
  }
}
