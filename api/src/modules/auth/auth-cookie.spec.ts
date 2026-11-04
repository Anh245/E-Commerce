import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToKenStrategy } from './strategies/refresh-token.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('HttpOnly authentication lifecycle', () => {
  let app: INestApplication<App>;
  let user: {
    id: string;
    email: string;
    password: string;
    firstName: null;
    lastName: null;
    role: 'USER';
    refreshToken: string | null;
  };
  const oldEnv = { ...process.env };
  const findUnique = jest.fn().mockImplementation(() => Promise.resolve(user));
  const update = jest.fn(
    ({ data }: { data: { refreshToken: string | null } }) => {
      Object.assign(user, data);
      return Promise.resolve(user);
    },
  );
  const updateMany = jest.fn(
    ({
      where,
      data,
    }: {
      where: { refreshToken: string };
      data: { refreshToken: string };
    }) => {
      if (user.refreshToken !== where.refreshToken)
        return Promise.resolve({ count: 0 });
      Object.assign(user, data);
      return Promise.resolve({ count: 1 });
    },
  );
  beforeAll(async () => {
    process.env.JWT_SECRET = 'cookie-lifecycle-test-secret';
    process.env.NODE_ENV = 'production';
    process.env.ALLOWED_ORIGINS = 'https://shop.example.test';
    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        RefreshToKenStrategy,
        {
          provide: PrismaService,
          useValue: { user: { findUnique, update, updateMany } },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  beforeEach(async () => {
    user = {
      id: 'qa-user',
      email: 'qa@example.test',
      password: await bcrypt.hash('qa-password', 4),
      firstName: null,
      lastName: null,
      role: 'USER',
      refreshToken: null,
    };
  });
  afterAll(async () => {
    await app.close();
    process.env = oldEnv;
  });
  const post = (action: string) =>
    request(app.getHttpServer())
      .post('/api/v1/auth/' + action)
      .set('Origin', 'https://shop.example.test')
      .set('X-CSRF-Protection', '1');
  const cookie = (response: request.Response) =>
    String(response.headers['set-cookie'][0]).split(';')[0];
  const login = () =>
    post('login')
      .send({ email: 'qa@example.test', password: 'qa-password' })
      .expect(201);
  it('sets a secure HttpOnly host-only cookie and never exposes refresh token in JSON', async () => {
    const response = await login();
    const header = String(response.headers['set-cookie'][0]);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('Secure');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/api/v1/auth');
    expect(header).not.toContain('Domain=');
    expect(response.body).not.toHaveProperty('refreshToken');
    expect((response.body as { user: object }).user).not.toHaveProperty(
      'refreshToken',
    );
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it('refreshes from the cookie, rotates it and rejects replay of the previous cookie', async () => {
    const signed = await login();
    const previous = cookie(signed);
    const refreshed = await post('refresh')
      .set('Cookie', previous)
      .send({})
      .expect(200);
    expect(cookie(refreshed)).not.toBe(previous);
    expect(refreshed.body).not.toHaveProperty('refreshToken');
    await post('refresh').set('Cookie', previous).send({}).expect(401);
    await post('refresh').set('Cookie', cookie(refreshed)).send({}).expect(200);
  });
  it('accepts at most one concurrent rotation of the same cookie', async () => {
    const signed = await login();
    const responses = await Promise.all([
      post('refresh').set('Cookie', cookie(signed)).send({}),
      post('refresh').set('Cookie', cookie(signed)).send({}),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 401,
    ]);
  });

  it('rejects body/header refresh tokens and cross-origin or headerless auth requests', async () => {
    const signed = await login();
    const token = cookie(signed).split('=')[1];
    await post('refresh')
      .set('Authorization', 'Bearer ' + token)
      .send({ refreshToken: token })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', 'https://evil.example')
      .set('X-CSRF-Protection', '1')
      .send({})
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Origin', 'https://shop.example.test')
      .send({})
      .expect(403);
  });
  it('logout revokes the hash and clears the same cookie path even without an access token', async () => {
    const signed = await login();
    const response = await post('logout')
      .set('Cookie', cookie(signed))
      .send({})
      .expect(201);
    expect(user.refreshToken).toBeNull();
    expect(String(response.headers['set-cookie'][0])).toContain(
      'Path=/api/v1/auth',
    );
    await post('refresh').set('Cookie', cookie(signed)).send({}).expect(401);
  });
  it('logout clears a missing or expired session without looping', async () => {
    const response = await post('logout')
      .set('Cookie', 'refresh_session=invalid')
      .send({})
      .expect(201);
    expect(String(response.headers['set-cookie'][0])).toContain(
      'refresh_session=;',
    );
  });
});
