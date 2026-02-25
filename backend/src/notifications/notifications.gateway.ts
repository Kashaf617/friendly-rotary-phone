import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(
    @ConnectedSocket() client: Socket,
    @MessageBody() tenantId: string,
  ) {
    client.join(`tenant-${tenantId}`);
    this.logger.log(`Client ${client.id} joined tenant room: ${tenantId}`);
    return { event: 'joinedTenant', data: tenantId };
  }

  @SubscribeMessage('joinKitchen')
  handleJoinKitchen(
    @ConnectedSocket() client: Socket,
    @MessageBody() tenantId: string,
  ) {
    client.join(`kitchen-${tenantId}`);
    return { event: 'joinedKitchen', data: tenantId };
  }

  // Emit methods for services to call
  emitNewOrder(tenantId: string, order: any) {
    this.server.to(`tenant-${tenantId}`).emit('newOrder', order);
    this.server.to(`kitchen-${tenantId}`).emit('kitchenNewOrder', order);
  }

  emitOrderStatusUpdate(tenantId: string, order: any) {
    this.server.to(`tenant-${tenantId}`).emit('orderStatusUpdate', order);
  }

  emitKitchenStatusUpdate(tenantId: string, data: any) {
    this.server.to(`tenant-${tenantId}`).emit('kitchenStatusUpdate', data);
    this.server.to(`kitchen-${tenantId}`).emit('kitchenItemUpdate', data);
  }

  emitLowStockAlert(tenantId: string, item: any) {
    this.server.to(`tenant-${tenantId}`).emit('lowStockAlert', item);
  }

  emitNotification(tenantId: string, notification: any) {
    this.server.to(`tenant-${tenantId}`).emit('notification', notification);
  }
}
