import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
  })
  slug?: string;
}
