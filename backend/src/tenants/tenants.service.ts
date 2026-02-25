import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findAll() {
    return this.tenantRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const tenant = this.tenantRepository.create({ ...dto, slug });
    return this.tenantRepository.save(tenant);
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.findOne(id);
    Object.assign(tenant, dto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
    return { message: 'Tenant deleted' };
  }

  async getStats() {
    const total = await this.tenantRepository.count();
    const active = await this.tenantRepository.count({ where: { is_active: true } });
    const trial = await this.tenantRepository.count({ where: { subscription_plan: 'trial' } });
    return { total, active, inactive: total - active, trial };
  }
}
