import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async findAllByTenant(tenantId: string) {
    return this.settingRepository.find({ where: { tenant_id: tenantId } });
  }

  async findByKey(tenantId: string, key: string) {
    return this.settingRepository.findOne({
      where: { tenant_id: tenantId, key },
    });
  }

  async upsert(tenantId: string, dto: CreateSettingDto) {
    const existing = await this.findByKey(tenantId, dto.key);
    if (existing) {
      existing.value = dto.value;
      return this.settingRepository.save(existing);
    }
    const setting = this.settingRepository.create({
      tenant_id: tenantId,
      ...dto,
    });
    return this.settingRepository.save(setting);
  }

  async update(tenantId: string, key: string, dto: UpdateSettingDto) {
    const setting = await this.findByKey(tenantId, key);
    if (!setting) throw new NotFoundException('Setting not found');
    if (dto.value !== undefined) {
      setting.value = dto.value;
    }
    return this.settingRepository.save(setting);
  }

  async remove(tenantId: string, key: string) {
    const setting = await this.findByKey(tenantId, key);
    if (!setting) throw new NotFoundException('Setting not found');
    await this.settingRepository.remove(setting);
    return { success: true };
  }
}
