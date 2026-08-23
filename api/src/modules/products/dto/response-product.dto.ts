import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: ' id of the product',
    example: '23knlwea2',
  })
  id?: string;

  @ApiProperty({
    description: 'Product name',
    example: 'IPhone 14 plus',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the Product',
    example: 'A product of Apple',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Product price',
    example: 99.99,
  })
  price: number;

  @ApiProperty({
    description: 'Product stock',
    example: 100,
  })
  stock: number;

  @ApiProperty({
    description: 'stock keeping Unit',
    example: 'WH-001',
  })
  sku: string;

  @ApiProperty({
    description: 'URL image of Product',
    example: 'https://example.com/ProductImage.jpg',
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Product category',
    example: 'smart-phone',
  })
  category: string | null;

  @ApiProperty({
    description: 'Product availability',
    example: true,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Product create time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Product update time',
  })
  updatedAt: Date;
}
