import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
//import { CreatePaymentIntentApiResponse } from './dto/payment-response.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { GetUser } from '../../commmon/decorators/get-user.decorator';
import {
  CreatePaymentIntentApiResponseDto,
  PaymentApiResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({
    summary: ' create payment intent',
    description: 'create a payment intent for a order',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created successfully ',
    type: CreatePaymentIntentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not found',
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser('id') userId: string,
  ) {
    return await this.paymentsService.createPaymentIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm payment',
    description: ' comfirm a payment intent for an order',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirm successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment not found or already completed',
  })
  async confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @GetUser('user') userId: string,
  ) {
    return await this.paymentsService.confirmPayment(confirmPaymentDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Get all payments for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: PaymentResponseDto,
  })
  async findAll(@GetUser('id') userId: string) {
    return await this.paymentsService.findAll(userId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'payment_1234567890',
  })
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Get a specific payment by its ID for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: PaymentApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.paymentsService.findOne(id, userId);
  }

  //Get paymentby orderID
  @Get('order/:orderId')
  @ApiParam({
    name: 'orderId',
    description: 'Order ID',
    example: 'order_1234567890',
  })
  @ApiOperation({
    summary: 'Get payment by order ID',
    description:
      'Get a specific payment by its order ID for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Payment retrieved successfully',
    type: PaymentApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  async findByOrderId(
    @Param('orderId') orderId: string,
    @GetUser('id') userId: string,
  ) {
    return await this.paymentsService.findByOrder(orderId, userId);
  }
}
