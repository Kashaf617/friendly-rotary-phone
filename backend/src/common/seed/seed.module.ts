import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { MenuCategory } from '../../menu/entities/menu-category.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Employee } from '../../hr/entities/employee.entity';
import { Setting } from '../../settings/entities/setting.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Tenant, User, Role, Subscription, MenuCategory, MenuItem, InventoryItem, Supplier, Employee, Setting]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
