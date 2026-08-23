import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    maxLength: 100,
    example: 'IPHONE 13',
    description: 'Name of the product want to create',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: ' the device is manufactured By Apple',
    required: false,
  })
  description: string;

  @ApiProperty({
    description: 'Price of the product ',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiProperty({
    description: 'stock keeping Unit(Sku) -unique indentifier',
    example: 'WH-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://a.com/b.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Smartphone',
    maxLength: 200,
    required: true,
  })
  @IsString()
  @IsOptional()
  categoryId: string;

  @ApiProperty({
    description: 'Whether product is active and available for purchase',
    default: true,
    required: false,
    example: true,
  })
  isActive?: boolean;
}
