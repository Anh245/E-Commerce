import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductResponseDto } from './dto/response-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Category, Prisma, Product } from 'prisma-client/client';
import { QueryProductDto } from './dto/query-product.dto';
import { contains } from 'class-validator';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const existingSku = await this.prismaService.product.findUnique({
      where: {
        sku: createProductDto.sku,
      },
    });

    // điều kiện: Có tồn tại existingSku thì mới báo trùng
    if (existingSku) {
      throw new ConflictException(`SKU ${createProductDto.sku} already exists`);
    }

    const product = await this.prismaService.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      price: Number(product.price),
      category: product.category.name,
    };
  }

  //find all product
  async findAll(queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;

    const where: Prisma.ProductWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prismaService.product.count({ where });

    const products = await this.prismaService.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },

      include: {
        category: true,
      },
    });

    return {
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
