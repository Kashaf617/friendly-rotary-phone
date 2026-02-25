import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { MenuCategory } from '../../menu/entities/menu-category.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(MenuCategory) private catRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private itemRepo: Repository<MenuItem>,
  ) {}

  async onModuleInit() {
    const seedOnStart =
      this.configService.get<string>('SEED_ON_START', 'false').toLowerCase() ===
      'true';
    const seedForce =
      this.configService.get<string>('SEED_FORCE', 'false').toLowerCase() ===
      'true';

    if (!seedOnStart && !seedForce) {
      return;
    }

    const tenantCount = await this.tenantRepo.count();
    if (tenantCount > 0 && !seedForce) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    await this.seed();
  }

  async seed() {
    this.logger.log('Seeding database...');

    // 1. Create system roles (no tenant)
    const superAdminRole = await this.roleRepo.save(
      this.roleRepo.create({
        name: 'super_admin',
        description: 'Platform Super Administrator',
        is_system_role: true,
        permissions: ['*'],
      }),
    );

    // 2. Create default tenant
    const tenant = await this.tenantRepo.save(
      this.tenantRepo.create({
        name: 'Demo Restaurant Dubai',
        slug: 'demo-restaurant-dubai',
        subscription_plan: 'professional',
        is_active: true,
        contact_email: 'admin@demo-restaurant.ae',
        contact_phone: '+971-4-123-4567',
        address: 'Downtown Dubai, UAE',
        city: 'Dubai',
        country: 'UAE',
        trn: '100234567890003',
        currency: 'AED',
        max_users: 50,
        max_branches: 3,
        settings: { theme: 'dark', language: 'en' },
        feature_flags: {
          pos: true, inventory: true, hr: true,
          accounting: true, analytics: true, ai_insights: true,
        },
      }),
    );

    // 3. Create tenant-specific roles
    const roles = await Promise.all([
      this.roleRepo.save(this.roleRepo.create({
        name: 'restaurant_admin', tenant_id: tenant.id,
        description: 'Restaurant Administrator', is_system_role: true,
        permissions: [
          'dashboard.view', 'orders.manage', 'menu.manage', 'inventory.manage',
          'hr.manage', 'accounting.manage', 'reports.view', 'settings.manage', 'users.manage',
        ],
      })),
      this.roleRepo.save(this.roleRepo.create({
        name: 'manager', tenant_id: tenant.id,
        description: 'Restaurant Manager', is_system_role: true,
        permissions: [
          'dashboard.view', 'orders.manage', 'menu.manage', 'inventory.manage',
          'hr.view', 'reports.view',
        ],
      })),
      this.roleRepo.save(this.roleRepo.create({
        name: 'cashier', tenant_id: tenant.id,
        description: 'Cashier', is_system_role: true,
        permissions: ['orders.manage', 'orders.payment', 'menu.view'],
      })),
      this.roleRepo.save(this.roleRepo.create({
        name: 'kitchen_staff', tenant_id: tenant.id,
        description: 'Kitchen Staff', is_system_role: true,
        permissions: ['orders.view', 'orders.kitchen_status', 'menu.view'],
      })),
      this.roleRepo.save(this.roleRepo.create({
        name: 'waiter', tenant_id: tenant.id,
        description: 'Waiter / Server', is_system_role: true,
        permissions: ['orders.create', 'orders.view', 'menu.view'],
      })),
      this.roleRepo.save(this.roleRepo.create({
        name: 'hr_officer', tenant_id: tenant.id,
        description: 'HR Officer', is_system_role: true,
        permissions: ['hr.manage', 'dashboard.view'],
      })),
    ]);

    const [adminRole, managerRole, cashierRole, kitchenRole, waiterRole, hrRole] = roles;

    // 4. Create users
    const passwordHash = await bcrypt.hash('Admin@123', 12);

    await this.userRepo.save(this.userRepo.create({
      email: 'superadmin@erp.ae',
      password_hash: passwordHash,
      first_name: 'Super', last_name: 'Admin',
      tenant_id: tenant.id, role_id: superAdminRole.id, is_active: true,
    }));

    await this.userRepo.save(this.userRepo.create({
      email: 'admin@demo-restaurant.ae',
      password_hash: passwordHash,
      first_name: 'Ahmed', last_name: 'Al Maktoum',
      tenant_id: tenant.id, role_id: adminRole.id, is_active: true,
    }));

    await this.userRepo.save(this.userRepo.create({
      email: 'manager@demo-restaurant.ae',
      password_hash: passwordHash,
      first_name: 'Fatima', last_name: 'Hassan',
      tenant_id: tenant.id, role_id: managerRole.id, is_active: true,
    }));

    await this.userRepo.save(this.userRepo.create({
      email: 'cashier@demo-restaurant.ae',
      password_hash: passwordHash,
      first_name: 'Omar', last_name: 'Khan',
      tenant_id: tenant.id, role_id: cashierRole.id, is_active: true,
    }));

    await this.userRepo.save(this.userRepo.create({
      email: 'kitchen@demo-restaurant.ae',
      password_hash: passwordHash,
      first_name: 'Raj', last_name: 'Patel',
      tenant_id: tenant.id, role_id: kitchenRole.id, is_active: true,
    }));

    // 5. Create subscription
    const now = new Date();
    await this.subRepo.save(this.subRepo.create({
      tenant_id: tenant.id,
      plan: 'professional', status: 'active', is_trial: false,
      monthly_price: 599, currency: 'AED',
      starts_at: now,
      expires_at: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      max_users: 25, max_branches: 3, max_orders_per_month: 5000,
      features: {
        pos: true, inventory: true, hr: true,
        accounting: true, analytics: true, ai_insights: true,
      },
    }));

    // 6. Create menu categories and items
    const appetizers = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenant.id, name: 'Appetizers', name_ar: 'مقبلات',
      description: 'Starters and appetizers', sort_order: 1, is_active: true,
    }));

    const mains = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenant.id, name: 'Main Course', name_ar: 'الأطباق الرئيسية',
      description: 'Main dishes', sort_order: 2, is_active: true,
    }));

    const beverages = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenant.id, name: 'Beverages', name_ar: 'المشروبات',
      description: 'Drinks and beverages', sort_order: 3, is_active: true,
    }));

    const desserts = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenant.id, name: 'Desserts', name_ar: 'الحلويات',
      description: 'Sweet treats', sort_order: 4, is_active: true,
    }));

    // Appetizer items
    const appetizerItems = [
      { name: 'Hummus', name_ar: 'حمص', price: 25, cost_price: 8, preparation_time_minutes: 5 },
      { name: 'Fattoush Salad', name_ar: 'سلطة فتوش', price: 30, cost_price: 10, preparation_time_minutes: 8 },
      { name: 'Grilled Halloumi', name_ar: 'حلومي مشوي', price: 35, cost_price: 14, preparation_time_minutes: 10 },
      { name: 'Falafel Plate', name_ar: 'طبق فلافل', price: 28, cost_price: 9, preparation_time_minutes: 12 },
      { name: 'Lamb Sambousek', name_ar: 'سمبوسك لحم', price: 32, cost_price: 12, preparation_time_minutes: 15 },
    ];

    for (const item of appetizerItems) {
      await this.itemRepo.save(this.itemRepo.create({
        tenant_id: tenant.id, category_id: appetizers.id, ...item,
        currency: 'AED', is_available: true, is_active: true,
      }));
    }

    // Main course items
    const mainItems = [
      {
        name: 'Mixed Grill Platter', name_ar: 'مشاوي مشكلة', price: 120, cost_price: 45,
        preparation_time_minutes: 25,
        modifiers: [
          { name: 'Size', options: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 30 }] },
          { name: 'Side', options: [{ label: 'Rice', price: 0 }, { label: 'Fries', price: 5 }, { label: 'Salad', price: 5 }] },
        ],
      },
      {
        name: 'Lamb Machboos', name_ar: 'مجبوس لحم', price: 85, cost_price: 32,
        preparation_time_minutes: 30,
        modifiers: [
          { name: 'Spice Level', options: [{ label: 'Mild', price: 0 }, { label: 'Medium', price: 0 }, { label: 'Hot', price: 0 }] },
        ],
      },
      { name: 'Grilled Sea Bass', name_ar: 'سمك سيباس مشوي', price: 95, cost_price: 38, preparation_time_minutes: 20 },
      { name: 'Chicken Shawarma', name_ar: 'شاورما دجاج', price: 45, cost_price: 15, preparation_time_minutes: 12 },
      { name: 'Beef Kebab', name_ar: 'كباب لحم', price: 75, cost_price: 28, preparation_time_minutes: 18 },
      { name: 'Biryani Royal', name_ar: 'برياني رويال', price: 65, cost_price: 22, preparation_time_minutes: 25 },
    ];

    for (const item of mainItems) {
      await this.itemRepo.save(this.itemRepo.create({
        tenant_id: tenant.id, category_id: mains.id, ...item,
        currency: 'AED', is_available: true, is_active: true,
      }));
    }

    // Beverage items
    const beverageItems = [
      { name: 'Fresh Lemon Mint', name_ar: 'ليمون بالنعناع', price: 18, cost_price: 4, preparation_time_minutes: 3 },
      { name: 'Arabic Coffee', name_ar: 'قهوة عربية', price: 15, cost_price: 3, preparation_time_minutes: 5 },
      { name: 'Mango Juice', name_ar: 'عصير مانجو', price: 20, cost_price: 5, preparation_time_minutes: 3 },
      { name: 'Turkish Tea', name_ar: 'شاي تركي', price: 12, cost_price: 2, preparation_time_minutes: 4 },
      { name: 'Sparkling Water', name_ar: 'مياه غازية', price: 10, cost_price: 2, preparation_time_minutes: 1 },
    ];

    for (const item of beverageItems) {
      await this.itemRepo.save(this.itemRepo.create({
        tenant_id: tenant.id, category_id: beverages.id, ...item,
        currency: 'AED', is_available: true, is_active: true,
      }));
    }

    // Dessert items
    const dessertItems = [
      { name: 'Kunafa', name_ar: 'كنافة', price: 35, cost_price: 12, preparation_time_minutes: 8 },
      { name: 'Um Ali', name_ar: 'أم علي', price: 30, cost_price: 10, preparation_time_minutes: 10 },
      { name: 'Luqaimat', name_ar: 'لقيمات', price: 25, cost_price: 8, preparation_time_minutes: 12 },
      { name: 'Baklava Selection', name_ar: 'بقلاوة مشكلة', price: 28, cost_price: 10, preparation_time_minutes: 2 },
    ];

    for (const item of dessertItems) {
      await this.itemRepo.save(this.itemRepo.create({
        tenant_id: tenant.id, category_id: desserts.id, ...item,
        currency: 'AED', is_available: true, is_active: true,
      }));
    }

    this.logger.log('Database seeded successfully!');
    this.logger.log('Login credentials:');
    this.logger.log('  Super Admin: superadmin@erp.ae / Admin@123');
    this.logger.log('  Restaurant Admin: admin@demo-restaurant.ae / Admin@123');
    this.logger.log('  Manager: manager@demo-restaurant.ae / Admin@123');
    this.logger.log('  Cashier: cashier@demo-restaurant.ae / Admin@123');
  }
}
