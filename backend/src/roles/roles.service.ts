import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAllByTenant(tenantId: string) {
    return this.roleRepository.find({
      where: [{ tenant_id: tenantId }, { is_system_role: true, tenant_id: undefined as any }],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(tenantId: string, data: Partial<Role>) {
    const role = this.roleRepository.create({ ...data, tenant_id: tenantId });
    return this.roleRepository.save(role);
  }

  async update(id: string, data: Partial<Role>) {
    const role = await this.findOne(id);
    if (role.is_system_role) {
      // Only allow updating permissions on system roles
      if (data.permissions) role.permissions = data.permissions;
    } else {
      Object.assign(role, data);
    }
    return this.roleRepository.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.is_system_role) {
      throw new Error('Cannot delete system roles');
    }
    await this.roleRepository.remove(role);
    return { message: 'Role deleted' };
  }
}
