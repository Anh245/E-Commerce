import { AuthService } from './auth.service';
import { RefreshToKenStrategy } from './strategies/refresh-token.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

describe('Refresh token storage and validation', () => {
  it('stores a hash and validates only the matching full token', async () => {
    const update = jest
      .fn<Promise<object>, [{ data: { refreshToken: string } }]>()
      .mockResolvedValue({});
    const findUnique = jest.fn().mockResolvedValue(null);
    const prisma = { user: { update, findUnique } } as unknown as PrismaService;
    const auth = new AuthService(prisma, {} as JwtService);
    const token = 'a'.repeat(100) + 'original';
    await auth.updateRefreshToken('user-1', token);
    const saved = update.mock.calls[0][0].data.refreshToken;
    expect(saved).not.toBe(token);
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'qa@example.test',
      role: 'USER',
      refreshToken: saved,
    });
    const strategy = new RefreshToKenStrategy(prisma);
    const request = (value: string) =>
      ({
        headers: { cookie: 'refresh_session=' + encodeURIComponent(value) },
      }) as Request;
    await expect(
      strategy.validate(request(token), {
        sub: 'user-1',
        email: 'qa@example.test',
      }),
    ).resolves.toMatchObject({ id: 'user-1' });
    await expect(
      strategy.validate(request('a'.repeat(100) + 'different'), {
        sub: 'user-1',
        email: 'qa@example.test',
      }),
    ).rejects.toThrow();
  });
  it('rejects legacy plaintext tokens so users can sign in again', async () => {
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', refreshToken: 'old-plaintext' }),
      },
    } as unknown as PrismaService;
    await expect(
      new RefreshToKenStrategy(prisma).validate(
        { headers: { cookie: 'refresh_session=old-plaintext' } } as Request,
        { sub: 'user-1', email: 'qa@example.test' },
      ),
    ).rejects.toThrow();
  });
});
