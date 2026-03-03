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
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Employee } from '../../hr/entities/employee.entity';
import { Setting } from '../../settings/entities/setting.entity';

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
    @InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
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
      plan_name: 'Professional',
      status: 'active',
      price: 599,
      duration_months: 12,
      start_date: now,
      end_date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
    }));

    // 6. Create settings (VAT, branding, etc.)
    await this.seedSettings(tenant.id);

    // 7. Create menu categories and items
    await this.seedMenu(tenant.id);

    // 8. Create inventory items
    await this.seedInventory(tenant.id);

    // 9. Create suppliers
    await this.seedSuppliers(tenant.id);

    // 10. Create employees
    await this.seedEmployees(tenant.id);

    this.logger.log('Database seeded successfully!');
    this.logger.log('Login credentials:');
    this.logger.log('  Super Admin: superadmin@erp.ae / Admin@123');
    this.logger.log('  Restaurant Admin: admin@demo-restaurant.ae / Admin@123');
    this.logger.log('  Manager: manager@demo-restaurant.ae / Admin@123');
    this.logger.log('  Cashier: cashier@demo-restaurant.ae / Admin@123');
  }

  private async seedSettings(tenantId: string) {
    const settings = [
      { key: 'vat_rate', value: '0.05', description: 'UAE VAT Rate (5%)' },
      { key: 'business_name', value: 'Demo Restaurant Dubai', description: 'Business Name' },
      { key: 'business_address', value: 'Downtown Dubai, UAE', description: 'Business Address' },
      { key: 'business_phone', value: '+971-4-123-4567', description: 'Business Phone' },
      { key: 'business_email', value: 'admin@demo-restaurant.ae', description: 'Business Email' },
      { key: 'currency', value: 'AED', description: 'Default Currency' },
      { key: 'timezone', value: 'Asia/Dubai', description: 'Timezone' },
      { key: 'receipt_footer', value: 'Thank you for dining with us!', description: 'Receipt Footer Text' },
      { key: 'theme', value: 'dark', description: 'UI Theme' },
      { key: 'language', value: 'en', description: 'Default Language' },
    ];

    for (const setting of settings) {
      await this.settingRepo.save(this.settingRepo.create({
        tenant_id: tenantId,
        ...setting,
      }));
    }
    this.logger.log('Settings seeded (VAT=5%, business info, etc.)');
  }

  private async seedMenu(tenantId: string) {
    const appetizers = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenantId, name: 'Appetizers', name_ar: 'مقبلات',
      description: 'Starters and appetizers', sort_order: 1, is_active: true,
    }));

    const mains = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenantId, name: 'Main Course', name_ar: 'الأطباق الرئيسية',
      description: 'Main dishes', sort_order: 2, is_active: true,
    }));

    const beverages = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenantId, name: 'Beverages', name_ar: 'المشروبات',
      description: 'Drinks and beverages', sort_order: 3, is_active: true,
    }));

    const desserts = await this.catRepo.save(this.catRepo.create({
      tenant_id: tenantId, name: 'Desserts', name_ar: 'الحلويات',
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
        tenant_id: tenantId, category_id: appetizers.id, ...item,
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
        tenant_id: tenantId, category_id: mains.id, ...item,
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
        tenant_id: tenantId, category_id: beverages.id, ...item,
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
        tenant_id: tenantId, category_id: desserts.id, ...item,
        currency: 'AED', is_available: true, is_active: true,
      }));
    }
    this.logger.log('Menu categories and items seeded');
  }

  private async seedInventory(tenantId: string) {
    const inventoryItems = [
      { name: 'Chicken Breast', sku: 'INV-001', unit: 'kg', stock_level: 45, low_stock_threshold: 20, unit_cost: 28, category: 'Meat' },
      { name: 'Lamb Leg', sku: 'INV-002', unit: 'kg', stock_level: 12, low_stock_threshold: 15, unit_cost: 55, category: 'Meat' },
      { name: 'Basmati Rice', sku: 'INV-003', unit: 'kg', stock_level: 80, low_stock_threshold: 25, unit_cost: 8, category: 'Grains' },
      { name: 'Olive Oil', sku: 'INV-004', unit: 'liter', stock_level: 8, low_stock_threshold: 10, unit_cost: 35, category: 'Oils' },
      { name: 'Tomatoes', sku: 'INV-005', unit: 'kg', stock_level: 30, low_stock_threshold: 15, unit_cost: 5, category: 'Vegetables' },
      { name: 'Halloumi Cheese', sku: 'INV-006', unit: 'kg', stock_level: 5, low_stock_threshold: 8, unit_cost: 42, category: 'Dairy' },
      { name: 'Arabic Bread', sku: 'INV-007', unit: 'pack', stock_level: 60, low_stock_threshold: 20, unit_cost: 3, category: 'Bakery' },
      { name: 'Lemons', sku: 'INV-008', unit: 'kg', stock_level: 18, low_stock_threshold: 10, unit_cost: 6, category: 'Fruits' },
      { name: 'Sea Bass', sku: 'INV-009', unit: 'kg', stock_level: 15, low_stock_threshold: 10, unit_cost: 45, category: 'Seafood' },
      { name: 'Mint Leaves', sku: 'INV-010', unit: 'bunch', stock_level: 25, low_stock_threshold: 10, unit_cost: 4, category: 'Herbs' },
    ];

    for (const item of inventoryItems) {
      await this.inventoryRepo.save(this.inventoryRepo.create({
        tenant_id: tenantId,
        ...item,
        is_active: true,
      }));
    }
    this.logger.log('Inventory items seeded');
  }

  private async seedSuppliers(tenantId: string) {
    const suppliers = [
      { name: 'Gulf Food Trading', category: 'Produce', contact_email: 'info@gulf-food.ae', contact_phone: '+971-4-123-4567', status: 'active', rating: 4.8, address: 'Al Quoz Industrial Area, Dubai' },
      { name: 'Arabian Coffee Roasters', category: 'Beverages', contact_email: 'orders@arabian-coffee.ae', contact_phone: '+971-4-555-1234', status: 'active', rating: 4.2, address: 'Dubai Investment Park' },
      { name: 'Desert Packaging', category: 'Packaging', contact_email: 'support@desert-pack.ae', contact_phone: '+971-6-222-9876', status: 'active', rating: 3.7, address: 'Sharjah Industrial Area' },
      { name: 'Fresh Meat Suppliers', category: 'Meat', contact_email: 'sales@freshmeat.ae', contact_phone: '+971-4-333-7890', status: 'active', rating: 4.5, address: 'Dubai Meat Market' },
      { name: 'Premium Seafood', category: 'Seafood', contact_email: 'orders@premiumseafood.ae', contact_phone: '+971-4-444-5678', status: 'active', rating: 4.6, address: 'Deira Fish Market, Dubai' },
    ];

    for (const supplier of suppliers) {
      await this.supplierRepo.save(this.supplierRepo.create({
        tenant_id: tenantId,
        ...supplier,
      }));
    }
    this.logger.log('Suppliers seeded');
  }

  private async seedEmployees(tenantId: string) {
    const employees = [
      { employee_number: 'EMP-00001', first_name: 'Ahmed', last_name: 'Al Maktoum', email: 'ahmed@demo-restaurant.ae', phone: '+971-50-123-4567', position: 'Restaurant Manager', department: 'Management', base_salary: 15000, hire_date: '2024-01-15', status: 'active' },
      { employee_number: 'EMP-00002', first_name: 'Fatima', last_name: 'Hassan', email: 'fatima@demo-restaurant.ae', phone: '+971-50-234-5678', position: 'Head Chef', department: 'Kitchen', base_salary: 12000, hire_date: '2024-02-01', status: 'active' },
      { employee_number: 'EMP-00003', first_name: 'Omar', last_name: 'Khan', email: 'omar@demo-restaurant.ae', phone: '+971-50-345-6789', position: 'Cashier', department: 'Front of House', base_salary: 5000, hire_date: '2024-03-10', status: 'active' },
      { employee_number: 'EMP-00004', first_name: 'Raj', last_name: 'Patel', email: 'raj@demo-restaurant.ae', phone: '+971-50-456-7890', position: 'Sous Chef', department: 'Kitchen', base_salary: 8000, hire_date: '2024-04-01', status: 'active' },
      { employee_number: 'EMP-00005', first_name: 'Sara', last_name: 'Ali', email: 'sara@demo-restaurant.ae', phone: '+971-50-567-8901', position: 'Waitress', department: 'Front of House', base_salary: 4500, hire_date: '2024-05-15', status: 'active' },
      { employee_number: 'EMP-00006', first_name: 'Mohammed', last_name: 'Ibrahim', email: 'mohammed@demo-restaurant.ae', phone: '+971-50-678-9012', position: 'Delivery Driver', department: 'Operations', base_salary: 4000, hire_date: '2024-06-01', status: 'on_leave' },
    ];

    for (const emp of employees) {
      await this.employeeRepo.save(this.employeeRepo.create({
        tenant_id: tenantId,
        ...emp,
      }));
    }
    this.logger.log('Employees seeded');
  }
}
