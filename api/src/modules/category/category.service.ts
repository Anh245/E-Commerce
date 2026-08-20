import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/response-category.dto';
import { Category, Prisma } from 'prisma-client/client';
import { QueryCategoryDto } from './dto/query-category.dto';
import { skip } from 'node:test';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  //create Category

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, slug, ...rest } = createCategoryDto;

    if (!name) {
      throw new Error('Category name is required');
    }

    const categorySlug =
      slug ?? name?.toLowerCase().replace(/\s+/g, '-').replace(/[^w-]/g, '');

    //Check category exist
    const existingCategory = await await this.prismaService.category.findUnique(
      {
        where: {
          slug: categorySlug,
        },
      },
    );

    if (existingCategory) {
      throw new Error(
        'Category with this slug already exists: ' + categorySlug,
      );
    }

    const category = await this.prismaService.category.create({
      data: {
        name,
        slug: categorySlug,
        ...rest,
      },
    });
    return this.formatCategory(category, 0);
  }

  //Find all categorys

  async findAll(queryDto: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { isActive, search, page = 1, limit = 10 } = queryDto;
    const where: Prisma.CategoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        {
          name: { contains: search, mode: 'insensitive' },
        },
        {
          description: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const total = await this.prismaService.category.count({ where });

    const categories = await this.prismaService.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      data: categories.map((category) => {
        return this.formatCategory(category, category._count.products);
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //Get category by ID
  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category cannot find');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  //Get Category by slug
  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prismaService.category.findUnique({
      where: {
        slug,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) throw new NotFoundException('Category not found');

    return this.formatCategory(category, Number(category._count.products));
  }

  //Updatecategory
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existingCategory = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (
      updateCategoryDto.slug &&
      updateCategoryDto.slug !== existingCategory.slug
    ) {
      const slugTaken = await this.prismaService.category.findUnique({
        where: {
          slug: updateCategoryDto.slug,
        },
      });

      if (slugTaken) {
        throw new ConflictException(
          `Slug ${updateCategoryDto.slug} is already! try orther slug :((`,
        );
      }
    }

    const updateCategory = await this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return this.formatCategory(
      updateCategory,
      Number(updateCategory._count.products),
    );
  }

  //Delete category
  async remove(id: string): Promise<{ message: string }> {
    const existCategory = await this.prismaService.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existCategory) {
      throw new NotFoundException('Not found Category');
    }

    if (existCategory._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${existCategory._count.products} products. Remove of reassign first`,
      );
    }

    await this.prismaService.category.delete({
      where: {
        id,
      },
    });
    return { message: 'Category deleted Successfully' };
  }

  //Format data to response for create
  private formatCategory(
    category: Category,
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      slug: category.slug,
      imageUrl: category.imageUrl ?? null,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
