import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const allowed = (
      process.env.ALLOWED_ORIGINS ??
      'http://localhost:3000,http://localhost:3001'
    )
      .split(',')
      .map((value) => value.trim());
    if (
      req.headers['x-csrf-protection'] !== '1' ||
      !req.headers.origin ||
      !allowed.includes(req.headers.origin)
    ) {
      throw new ForbiddenException('Invalid authentication request origin');
    }
    return true;
  }
}
