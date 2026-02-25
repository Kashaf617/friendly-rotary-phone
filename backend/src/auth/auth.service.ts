import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { LoginDto, RegisterDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role', 'tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.tenant && !user.tenant.is_active) {
      throw new UnauthorizedException('Tenant account is suspended');
    }

    // Update last login
    await this.userRepository.update(user.id, { last_login_at: new Date() });

    const tokens = await this.generateTokens(user);

    // Store refresh token hash
    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.update(user.id, { refresh_token: refreshHash });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role?.name,
        permissions: user.role?.permissions || [],
        tenant_id: user.tenant_id,
        tenant_name: user.tenant?.name,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create tenant
    const slug = registerDto.tenant_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const tenant = this.tenantRepository.create({
      name: registerDto.tenant_name,
      slug,
      subscription_plan: 'trial',
      is_active: true,
      contact_email: registerDto.email,
      currency: 'AED',
      country: 'UAE',
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Get or create restaurant_admin role
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'restaurant_admin', tenant_id: savedTenant.id },
    });

    if (!adminRole) {
      adminRole = this.roleRepository.create({
        name: 'restaurant_admin',
        tenant_id: savedTenant.id,
        description: 'Restaurant Administrator',
        is_system_role: true,
        permissions: [
          'dashboard.view',
          'orders.manage',
          'menu.manage',
          'inventory.manage',
          'hr.manage',
          'accounting.manage',
          'reports.view',
          'settings.manage',
          'users.manage',
        ],
      });
      adminRole = await this.roleRepository.save(adminRole);
    }

    // Create user
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      email: registerDto.email,
      password_hash: passwordHash,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      tenant_id: savedTenant.id,
      role_id: adminRole.id,
      is_active: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Create trial subscription
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const subscription = this.subscriptionRepository.create({
      tenant_id: savedTenant.id,
      plan_name: 'Trial',
      status: 'active',
      price: 0,
      duration_months: 1,
      start_date: now,
      end_date: trialEnd,
    });

    await this.subscriptionRepository.save(subscription);

    // Generate tokens
    const tokens = await this.generateTokens({
      ...savedUser,
      role: adminRole,
    } as User);

    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.update(savedUser.id, {
      refresh_token: refreshHash,
    });

    this.logger.log(
      `New tenant registered: ${savedTenant.name} (${savedTenant.id})`,
    );

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        role: adminRole.name,
        permissions: adminRole.permissions,
        tenant_id: savedTenant.id,
        tenant_name: savedTenant.name,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshValid = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    if (!isRefreshValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepository.update(user.id, { refresh_token: refreshHash });

    return tokens;
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refresh_token: undefined as any });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role?.name,
      permissions: user.role?.permissions || [],
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 900, // 15 minutes
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 604800, // 7 days
    });

    return { access_token, refresh_token };
  }
}
