import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentTenant, CurrentUser } from '../common/decorators/tenant.decorator';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('unread_only') unreadOnly?: string,
  ) {
    return this.notificationsService.findAll(
      tenantId,
      userId,
      unreadOnly === 'true',
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.notificationsService.markAsRead(id, tenantId);
  }

  @Patch('read-all')
  markAllAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(tenantId, userId);
  }
}
