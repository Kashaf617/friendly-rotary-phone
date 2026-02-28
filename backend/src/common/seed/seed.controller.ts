import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { SeedService } from './seed.service';

@Controller('seed')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @Roles('super_admin')
  async runSeed() {
    await this.seedService.seed();
    return { message: 'Database seeded successfully' };
  }
}
