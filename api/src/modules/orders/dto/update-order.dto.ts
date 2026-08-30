import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'prisma-client/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
