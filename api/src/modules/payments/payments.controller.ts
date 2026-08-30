import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePaymentIntentAPiResponse } from './dto/payment-response.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { GetUser } from '../../commmon/decorators/get-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({
    summary: ' create payment intent',
    description: 'create a payment intent for a order',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created successfully ',
    type: CreatePaymentIntentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'invalid data or order not found',
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser('id') userId: string,
  ) {
    return await this.paymentsService.createPaymentIntent(userId);
  }
}
