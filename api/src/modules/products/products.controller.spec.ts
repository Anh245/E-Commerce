import { Test } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { Request } from 'express';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  ProductImagesService,
  MAX_PRODUCT_IMAGE_BYTES,
} from './product-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';

describe('ProductsController multipart product form', () => {
  let app: INestApplication<App>;
  const products = { create: jest.fn(), update: jest.fn(), findOne: jest.fn() };
  const images = { upload: jest.fn(), discard: jest.fn() };
  const fields = {
    name: 'Test product',
    description: 'Test description',
    sku: 'TEST-1',
    price: '12.34',
    stock: '2',
    categoryId: 'category-1',
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: ProductImagesService, useValue: images },
        RoleGuard,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context
            .switchToHttp()
            .getRequest<Request & { user: { role: string } }>();
          if (!req.headers.authorization) throw new UnauthorizedException();
          req.user = {
            role:
              req.headers.authorization === 'Bearer admin' ? 'ADMIN' : 'USER',
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    products.create.mockResolvedValue({
      id: 'product-1',
      imageUrl: 'https://images.example.test/products/new.webp',
    });
    products.update.mockResolvedValue({
      id: 'product-1',
      imageUrl: 'https://images.example.test/products/new.webp',
    });
    products.findOne.mockResolvedValue({ id: 'product-1' });
    images.upload.mockResolvedValue({
      imageUrl: 'https://images.example.test/products/new.webp',
      key: 'products/new.webp',
    });
    images.discard.mockResolvedValue(undefined);
  });
  afterAll(async () => {
    await app.close();
  });

  it('saves form fields and image in a single admin request', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', 'Bearer admin')
      .field(fields)
      .attach('file', Buffer.from('image bytes'), 'photo.png')
      .expect(201);
    expect(products.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test product',
        price: 12.34,
        stock: 2,
        imageUrl: 'https://images.example.test/products/new.webp',
      }),
    );
  });
  it('requires an image for a newly created product', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', 'Bearer admin')
      .send({ ...fields, price: 12.34, stock: 2 })
      .expect(400);
    expect(products.create).not.toHaveBeenCalled();
  });
  it.each([undefined, 'Bearer user'])(
    'rejects uploads without admin permission: %s',
    async (authorization) => {
      const req = request(app.getHttpServer()).post(
        '/api/v1/products/product-1/image',
      );
      if (authorization) req.set('Authorization', authorization);
      await req
        .attach('file', Buffer.from('image'), 'photo.png')
        .expect(authorization ? 403 : 401);
      expect(images.upload).not.toHaveBeenCalled();
    },
  );
  it('rejects oversized multipart bodies before storage', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products/product-1/image')
      .set('Authorization', 'Bearer admin')
      .attach('file', Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1), 'large.png')
      .expect(413);
    expect(images.upload).not.toHaveBeenCalled();
  });
  it('does not create a product when image validation/upload fails', async () => {
    images.upload.mockRejectedValueOnce(
      new BadRequestException('Invalid image'),
    );
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', 'Bearer admin')
      .field(fields)
      .attach('file', Buffer.from('invalid'), 'photo.png')
      .expect(400);
    expect(products.create).not.toHaveBeenCalled();
  });
  it('cleans up the new image if product persistence fails', async () => {
    products.create.mockRejectedValueOnce(
      new BadRequestException('Duplicate SKU'),
    );
    await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', 'Bearer admin')
      .field(fields)
      .attach('file', Buffer.from('image'), 'photo.png')
      .expect(400);
    expect(images.discard).toHaveBeenCalledWith('products/new.webp');
  });
  it('keeps the current image when editing fields without a replacement file', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/products/product-1')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'Updated' })
      .expect(200);
    expect(images.upload).not.toHaveBeenCalled();
    expect(products.update).toHaveBeenCalledWith('product-1', {
      name: 'Updated',
    });
  });
  it('updates fields and replacement image together', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/products/product-1')
      .set('Authorization', 'Bearer admin')
      .field('name', 'Updated')
      .attach('file', Buffer.from('image'), 'photo.png')
      .expect(200);
    expect(products.update).toHaveBeenCalledWith('product-1', {
      name: 'Updated',
      imageUrl: 'https://images.example.test/products/new.webp',
    });
  });
});
