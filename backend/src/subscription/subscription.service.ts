import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findByTenant(tenantId: string) {
    return this.subscriptionRepository.findOne({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findAll() {
    return this.subscriptionRepository.find({ order: { created_at: 'DESC' } });
  }

  async create(dto: CreateSubscriptionDto) {
    const sub = this.subscriptionRepository.create({
      ...dto,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
    });
    return this.subscriptionRepository.save(sub);
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    const sub = await this.subscriptionRepository.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    Object.assign(sub, {
      ...dto,
      start_date: dto.start_date ? new Date(dto.start_date) : sub.start_date,
      end_date: dto.end_date ? new Date(dto.end_date) : sub.end_date,
    });
    return this.subscriptionRepository.save(sub);
  }

  async delete(id: string) {
    const sub = await this.subscriptionRepository.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    await this.subscriptionRepository.remove(sub);
    return { success: true };
  }

  async upgradePlan(tenantId: string, planName: string) {
    const sub = await this.findByTenant(tenantId);
    if (!sub) throw new NotFoundException('No subscription found');

    const planConfig: Record<string, any> = {
      starter: { price: 299, duration_months: 12 },
      professional: { price: 599, duration_months: 12 },
      enterprise: { price: 999, duration_months: 12 },
    };

    const config = planConfig[planName.toLowerCase()];
    if (!config) throw new NotFoundException('Invalid plan');

    sub.plan_name = planName;
    sub.status = 'active';
    sub.price = config.price;
    sub.duration_months = config.duration_months;
    sub.end_date = new Date(Date.now() + config.duration_months * 30 * 24 * 60 * 60 * 1000);

    return this.subscriptionRepository.save(sub);
  }

  async checkLimits(tenantId: string) {
    const sub = await this.findByTenant(tenantId);
    if (!sub) return { valid: false, reason: 'No subscription' };

    if (sub.status !== 'active') return { valid: false, reason: 'Subscription inactive' };
    if (new Date() > sub.end_date) return { valid: false, reason: 'Subscription expired' };

    return { valid: true, subscription: sub };
  }
}
