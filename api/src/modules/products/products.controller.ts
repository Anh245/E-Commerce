import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from '../../commmon/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  MAX_PRODUCT_IMAGE_BYTES,
  ProductImagesService,
} from './product-images.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productImagesService: ProductImagesService,
  ) {}

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PRODUCT_IMAGE_BYTES, files: 1, fields: 0 },
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Tải ảnh sản phẩm lên Cloudinary (chỉ admin)' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.productsService.findOne(id);
    const image = await this.productImagesService.upload(file);
    try {
      return await this.productsService.update(id, {
        imageUrl: image.imageUrl,
      });
    } catch (error) {
      await this.productImagesService.discard(image.key);
      throw error;
    }
  }

  //Create
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PRODUCT_IMAGE_BYTES, files: 1, fields: 10 },
    }),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
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
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    if (!file && !createProductDto.imageUrl)
      throw new BadRequestException('Cần cung cấp ảnh sản phẩm');
    const image = file
      ? await this.productImagesService.upload(file)
      : undefined;
    try {
      return await this.productsService.create({
        ...createProductDto,
        ...(image && { imageUrl: image.imageUrl }),
      });
    } catch (error) {
      if (image) await this.productImagesService.discard(image.key);
      throw error;
    }
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

  //Get product by id
  @Get(':id')
  @ApiOperation({
    summary: 'Get prduct by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productsService.findOne(id);
  }

  //UpdateProduct
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PRODUCT_IMAGE_BYTES, files: 1, fields: 10 },
    }),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a product (Admin Only)',
  })
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Update product cuccess',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Sku already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    if (file) await this.productsService.findOne(id);
    const image = file
      ? await this.productImagesService.upload(file)
      : undefined;
    try {
      return await this.productsService.update(id, {
        ...updateProductDto,
        ...(image && { imageUrl: image.imageUrl }),
      });
    } catch (error) {
      if (image) await this.productImagesService.discard(image.key);
      throw error;
    }
  }

  //Update product Stock
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update product stock',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description:
            'Stock adjustment (positive to add, negatice to subtract)',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update stock cuccess',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product stock not found',
  })
  @ApiResponse({
    status: 400,
    description: 'insufficient stock',
  })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateStock(id, quantity);
  }

  //Remove a product
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Delete completed',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete product in active orders',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.productsService.remove(id);
  }
}
