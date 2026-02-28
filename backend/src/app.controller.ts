import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    const dbConnected = this.dataSource.isInitialized;
    const timestamp = new Date().toISOString();

    return {
      status: dbConnected ? 'ok' : 'error',
      timestamp,
      database: dbConnected ? 'connected' : 'disconnected',
      version: '1.0.0',
    };
  }
}
