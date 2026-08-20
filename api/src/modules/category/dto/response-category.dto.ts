import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: 'adwdawda-dawdawd',
    description: 'unique for indentify  of category',
  })
  id: string;

  @ApiProperty({
    example: 'Smart Phone',
    description: 'Name of the Category',
  })
  name: string;

  @ApiProperty({
    example: 'Device for entertaiment',
    nullable: true,
    description: 'a brief description of the category',
  })
  description?: string | null;

  @ApiProperty({
    example: 'Televisions',
    description: 'The URL-friendly slug for the category',
    nullable: true,
  })
  slug: string | null;

  @ApiProperty({
    example: 'https://Anh.com/images/tv.png',
    description: 'URL of image category',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: true,
    description: 'Indicates if the category is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: 130,
    description: 'Number of this category',
  })
  productCount: number;

  @ApiProperty({
    example: '2024-1-1T12:00:00Z',
    description: 'Date and time when create category',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-1-1T12:00:00Z',
    description: 'Date and time when update category',
  })
  updatedAt: Date;
}
