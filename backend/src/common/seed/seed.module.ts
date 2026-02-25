import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { MenuCategory } from '../../menu/entities/menu-category.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Tenant, User, Role, Subscription, MenuCategory, MenuItem]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
