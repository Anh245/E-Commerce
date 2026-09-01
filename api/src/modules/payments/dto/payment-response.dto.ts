import { ApiProperty } from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './create-payment-intent.dto';

export class PaymentResponseDto {
  @ApiProperty({
    example: 'foesinf-fesfiknlesf',
  })
  id: string;

  @ApiProperty({
    example: 'order-123',
  })
  orderId: string;

  @ApiProperty({
    example: 99.99,
  })
  amount: number;

  @ApiProperty({
    example: 'user_123',
  })
  userId: string;

  @ApiProperty({
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({
    example: 'STRIPE',
    nullable: true,
  })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'pi_123435',
    nullable: true,
  })
  transactionId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
export class CreatePaymentIntentResponse {
  @ApiProperty({
    example: 'pi_12324325',
    description: 'Stripe client secret for payment confirmation',
  })
  clientSecret: string;

  @ApiProperty({
    example: '1231-4234-53453',
    description: 'payment ID in database ',
  })
  paymentId: string;
}
export class CreatePaymentIntentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: PaymentResponseDto,
  })
  data: CreatePaymentIntentDto;
  @ApiProperty({
    example: 'payment intent created successfully',
    required: false,
  })
  message: string;
}

export class PaymentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: CreatePaymentIntentApiResponseDto,
  })
  data: PaymentResponseDto;
  @ApiProperty({
    example: 'Payment retrieved successfully',
    required: false,
  })
  message: string;
}
