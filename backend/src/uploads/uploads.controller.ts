import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import * as fs from 'fs';
import * as path from 'path';

interface UploadBase64Dto {
  data_url: string; // data:image/webp;base64,XXXXX
  filename?: string; // optional base name
}

@Controller('uploads')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UploadsController {
  @Post('base64')
  @Roles('restaurant_admin')
  async uploadBase64(
    @CurrentTenant() tenantId: string,
    @Body() body: UploadBase64Dto,
  ) {
    const { data_url, filename } = body || {} as any;
    if (!data_url || typeof data_url !== 'string' || !data_url.startsWith('data:')) {
      return { success: false, error: 'Invalid data URL' };
    }

    // Parse data URL
    const match = data_url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      return { success: false, error: 'Unsupported data URL format' };
    }
    const mime = match[1];
    const b64 = match[2];
    if (!mime.startsWith('image/')) {
      return { success: false, error: 'Only image uploads are allowed' };
    }

    const buffer = Buffer.from(b64, 'base64');

    const ext = mime.split('/')[1] || 'webp';
    const safeBase = (filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'image';
    const ts = Date.now();
    const outDir = path.resolve(process.cwd(), 'uploads', tenantId);
    const outName = `${safeBase}-${ts}.${ext}`;
    const outPath = path.join(outDir, outName);

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, buffer);

    const url = `/uploads/${tenantId}/${outName}`;
    return { success: true, url };
  }
}
