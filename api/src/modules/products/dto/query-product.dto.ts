import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Min } from 'class-validator';

export class QueryProductDto {
  @ApiProperty({
    description: 'Filter by category',
    example: 'electronics',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'search by name',
    example: 'smartphone',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
