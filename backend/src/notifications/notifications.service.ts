import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  async create(tenantId: string, data: Partial<Notification>) {
    const notification = this.notificationRepository.create({
      ...data,
      tenant_id: tenantId,
    });
    const saved = await this.notificationRepository.save(notification);
    this.gateway.emitNotification(tenantId, saved);
    return saved;
  }

  async findAll(tenantId: string, userId?: string, unreadOnly?: boolean) {
    const where: any = { tenant_id: tenantId };
    if (userId) where.user_id = userId;
    if (unreadOnly) where.is_read = false;
    return this.notificationRepository.find({
      where,
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, tenantId: string) {
    await this.notificationRepository.update(
      { id, tenant_id: tenantId },
      { is_read: true },
    );
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(tenantId: string, userId: string) {
    await this.notificationRepository.update(
      { tenant_id: tenantId, user_id: userId, is_read: false },
      { is_read: true },
    );
    return { message: 'All notifications marked as read' };
  }
}
