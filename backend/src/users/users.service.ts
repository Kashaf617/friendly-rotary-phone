import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllByTenant(tenantId: string) {
    return this.userRepository.find({
      where: { tenant_id: tenantId },
      relations: ['role'],
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role_id', 'is_active', 'avatar_url', 'last_login_at', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      ...dto,
      tenant_id: tenantId,
      password_hash: passwordHash,
    });
    const saved = await this.userRepository.save(user);
    const { password_hash, refresh_token, ...result } = saved;
    return result;
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    const user = await this.findOne(id, tenantId);
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    const { password_hash, refresh_token, ...result } = saved;
    return result;
  }

  async remove(id: string, tenantId: string) {
    const user = await this.findOne(id, tenantId);
    await this.userRepository.remove(user);
    return { message: 'User deleted' };
  }
}
