import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductResponseDto } from './dto/response-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Category, Prisma, Product } from 'prisma-client/client';
import { QueryProductDto } from './dto/query-product.dto';
import { contains } from 'class-validator';
import { UpdateProductDto } from './dto/update-product.dto';

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

  //FindById
  async findOne(userId): Promise<ProductResponseDto> {
    const selectedProduct = await this.prismaService.product.findUnique({
      where: {
        id: userId,
      },
      include: {
        category: true,
      },
    });

    if (!selectedProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(selectedProduct);
  }

  //Update product
  async update(
    userId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prismaService.product.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found!');
    }
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuTaken = await this.prismaService.product.findUnique({
        where: {
          sku: updateProductDto.sku,
        },
      });

      if (skuTaken) {
        throw new ConflictException(
          `Product with Sku ${updateProductDto.sku} already exist`,
        );
      }
    }

    const updateData: any = { ...updateProductDto };

    if (updateProductDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }

    const updateProduct = await this.prismaService.product.update({
      where: { id: userId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.formatProduct(updateProduct);
  }

  //Update stock product
  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updateProduct = await this.prismaService.product.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: true,
      },
    });
    return this.formatProduct(updateProduct);
  }

  //Remove product
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete product that is part of existing orders. Consider marking it as inative',
      );
    }

    await this.prismaService.product.delete({
      where: {
        id,
      },
    });

    return { message: 'Product deleted successfully' };
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
