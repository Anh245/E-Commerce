import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';
import { Role } from 'prisma-client/client';
import { Roles } from '../../commmon/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //Create
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'create a new product',
  })
  @ApiResponse({
    status: 201,
    description: 'create product completed',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'SKu already exist',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden -  Only Admin required',
  })
  @ApiBody({
    type: CreateProductDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.create(createProductDto);
  }

  //Get all product
  @Get()
  @ApiOperation({
    summary: 'Get all product',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ProductResponseDto',
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryProductDto) {
    return await this.productsService.findAll(queryDto);
  }
}
