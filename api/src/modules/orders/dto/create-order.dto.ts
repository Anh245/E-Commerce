import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Price must be a valid number(e.g.,49.99)',
    },
  )
  @Type(() => Number)
  price?: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => OrderItemDto)
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shippingAddress: string;
}
