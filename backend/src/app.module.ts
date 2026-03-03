import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { HrModule } from './hr/hr.module';
import { AccountingModule } from './accounting/accounting.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { SeedModule } from './common/seed/seed.module';
import { UploadsModule } from './uploads/uploads.module';

// Entities
import { Tenant } from './tenants/entities/tenant.entity';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { MenuCategory } from './menu/entities/menu-category.entity';
import { MenuItem } from './menu/entities/menu-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { InventoryItem } from './inventory/entities/inventory-item.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { PurchaseOrder } from './suppliers/entities/purchase-order.entity';
import { Employee } from './hr/entities/employee.entity';
import { Attendance } from './hr/entities/attendance.entity';
import { Payroll } from './hr/entities/payroll.entity';
import { Invoice } from './accounting/entities/invoice.entity';
import { Transaction } from './accounting/entities/transaction.entity';
import { Subscription } from './subscription/entities/subscription.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Setting } from './settings/entities/setting.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const sslEnabled =
          configService.get<string>('DB_SSL', 'true').toLowerCase() === 'true';
        const sslConfig = sslEnabled ? { rejectUnauthorized: false } : undefined;

        const synchronize =
          configService
            .get<string>(
              'DB_SYNCHRONIZE',
              configService.get<string>('NODE_ENV') !== 'production' ? 'true' : 'false',
            )
            .toLowerCase() === 'true';

        let host = configService.get<string>('DB_HOST', 'localhost');
        let port = configService.get<number>('DB_PORT', 5432);
        let username = configService.get<string>('DB_USERNAME', 'postgres');
        let password = configService.get<string>('DB_PASSWORD', 'postgres');
        let database = configService.get<string>('DB_NAME', 'restaurant_erp');

        if (databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            host = url.hostname;
            port = url.port ? Number(url.port) : port;
            username = decodeURIComponent(url.username);
            password = decodeURIComponent(url.password);
            database = url.pathname?.replace(/^\//, '') || database;
          } catch {
            // If DATABASE_URL is invalid, fall back to discrete DB_* env vars
          }
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          uuidExtension: 'pgcrypto',
          entities: [
            Tenant,
            User,
            Role,
            MenuCategory,
            MenuItem,
            Order,
            OrderItem,
            InventoryItem,
            Supplier,
            PurchaseOrder,
            Employee,
            Attendance,
            Payroll,
            Invoice,
            Transaction,
            Subscription,
            Notification,
            Setting,
          ],
          synchronize,
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl: sslConfig,
          extra: sslConfig ? { ssl: sslConfig } : {},
        };
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    MenuModule,
    OrdersModule,
    InventoryModule,
    SuppliersModule,
    HrModule,
    AccountingModule,
    SubscriptionModule,
    AnalyticsModule,
    NotificationsModule,
    SettingsModule,
    SeedModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
