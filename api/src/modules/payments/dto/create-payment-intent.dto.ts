import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['usd'])
  currency?: string = 'usd';

  @IsOptional()
  @IsString()
  description?: string;
}
