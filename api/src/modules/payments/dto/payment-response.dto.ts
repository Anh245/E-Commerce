import { ApiProperty } from '@nestjs/swagger';

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
export class PaymentApiResponse {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: CreatePaymentIntentResponse,
  })
  data: PaymentResponseDto;
  @ApiProperty({
    example: 'payment intent create successfully',
    required: false,
  })
  message: string;
}
