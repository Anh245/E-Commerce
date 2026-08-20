import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryCategoryDto {
  @ApiProperty({
    example: true,
    description: 'Filter by active status',
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Search term to filter categories by name or description',
    example: 'Television',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Page number for pageination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiProperty({
    description: 'Page number limits for pageination',
    example: 10,
    default: 10,
    minimum: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @IsOptional()
  limit?: 10;
}
