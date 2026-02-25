import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    // Extract tenant_id from JWT payload (set by auth guard)
    // or from a custom header for internal service calls
    const tenantId =
      (req as any).user?.tenant_id ||
      req.headers['x-tenant-id'] as string;

    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  }
}
