import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Tivi',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'description of catagory',
    example: 'San xuat tai TP HaiPhong.... Resolution: 2k',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  dscription?: string;

  @ApiProperty({
    example: 'electronics',
    description: 'The URL-friendly slug for the category',
    required: false,
    maxLength: 100,
  })
  slug?: string;

  @ApiProperty({
    example: 'https://Anh.com/images/tv.png',
    description: 'URL of image category',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the category is active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
