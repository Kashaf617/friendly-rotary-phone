import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

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

const sslEnabled = (process.env.DB_SSL ?? 'true').toLowerCase() === 'true';
const databaseUrl = process.env.DATABASE_URL;

let host = process.env.DB_HOST ?? 'localhost';
let port = Number(process.env.DB_PORT ?? 5432);
let username = process.env.DB_USERNAME ?? 'postgres';
let password = process.env.DB_PASSWORD ?? 'postgres';
let database = process.env.DB_NAME ?? 'restaurant_erp';

if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    host = url.hostname;
    port = url.port ? Number(url.port) : port;
    username = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password);
    database = url.pathname.replace(/^\//, '') || database;
  } catch (error) {
    console.warn('Invalid DATABASE_URL, falling back to discrete DB_* env vars.', error);
  }
}

export const AppDataSource = new DataSource({
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
  ],
  migrations: ['dist/migrations/*.js'],
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  extra: sslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
});
