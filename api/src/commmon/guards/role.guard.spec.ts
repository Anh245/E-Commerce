import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'prisma-client/client';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  it('should allow admin users when role metadata matches', () => {
    const guard = new RoleGuard(new Reflector());
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    Reflect.defineMetadata('roles', [Role.ADMIN], context.getHandler());

    expect(guard.canActivate(context)).toBe(true);
  });
});
