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

  async getVatConfig(tenantId: string) {
    const enabledSetting = await this.findByKey(tenantId, 'VAT_ENABLED');
    const rateSetting = await this.findByKey(tenantId, 'VAT_RATE');

    const enabledRaw = enabledSetting?.value?.toLowerCase();
    const enabled =
      enabledRaw === undefined
        ? true
        : enabledRaw === 'true' || enabledRaw === '1' || enabledRaw === 'yes';

    let rate = rateSetting?.value ? Number(rateSetting.value) : 0.05;
    if (!Number.isFinite(rate) || rate < 0) rate = 0.05;
    if (rate > 1) rate = rate / 100;

    return { enabled, rate: enabled ? rate : 0 };
  }

  async getBrandingConfig(tenantId: string) {
    const nameSetting = await this.findByKey(tenantId, 'BUSINESS_NAME');
    const logoSetting = await this.findByKey(tenantId, 'BUSINESS_LOGO_URL');

    return {
      business_name: nameSetting?.value || null,
      business_logo_url: logoSetting?.value || null,
    };
  }
}
