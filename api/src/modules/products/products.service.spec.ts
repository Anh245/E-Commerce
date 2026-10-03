import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: {
    product: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      product: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters products by category id', async () => {
    await service.findAll({ category: 'category-1', page: 1, limit: 10 });

    expect(prismaService.product.count).toHaveBeenCalledWith({
      where: { categoryId: 'category-1' },
    });
    expect(prismaService.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: 'category-1' },
      }),
    );
  });
});
