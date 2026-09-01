import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
