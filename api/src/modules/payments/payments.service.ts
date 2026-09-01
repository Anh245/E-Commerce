import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentStatus, Prisma } from 'prisma-client/client';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(private readonly prismaService: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<{
    success: boolean;
    data: { clientSecret: string; paymentId: string };
    messsage: string;
  }> {
    const { orderId, amount, currency = 'usd' } = createPaymentIntentDto;

    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const existingPayment = await this.prismaService.payment.findFirst({
      where: {
        orderId,
      },
    });

    if (existingPayment && existingPayment.status == PaymentStatus.SUCCESS) {
      throw new BadRequestException('payment already completed for this order');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId, userId },
    });

    const payment = await this.prismaService.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret!,
        paymentId: payment.id,
      },
      messsage: 'Payment intent created successfully',
    };
  }

  async confirmPayment(
    confirmPaymentDto: ConfirmPaymentDto,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const { paymentIntentId, orderId } = confirmPaymentDto;
    const payment = await this.prismaService.payment.findFirst({
      where: {
        orderId,
        userId,
        transactionId: paymentIntentId,
      },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Payment already completed');
    }

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    const [updatePayment] = await this.prismaService.$transaction([
      this.prismaService.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.SUCCESS,
        },
        select: {
          id: true,
          orderId: true,
          userId: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'PROCESSING',
        },
      }),
    ]);

    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (order?.cartId) {
      await this.prismaService.cart.update({
        where: {
          id: order.cartId,
        },
        data: {
          checkedOut: true,
        },
      });
    }

    return {
      success: true,
      data: this.mapPaymentResponse(updatePayment),
      message: 'Payment confirm successfully',
    };
  }

  async findAll(userId: string): Promise<{
    success: boolean;
    data: PaymentResponseDto[];
    message: string;
  }> {
    const payments = await this.prismaService.payment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      success: true,
      data: payments.map((payment) => this.mapPaymentResponse(payment)),
      message: 'Payments retrieved successfully',
    };
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const payment = await this.prismaService.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      success: true,
      data: this.mapPaymentResponse(payment),
      message: 'Payment retrieved successfully',
    };
  }

  //find payment by orderId
  async findByOrder(
    orderId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    data: PaymentResponseDto;
    message: string;
  }> {
    const payment = await this.prismaService.payment.findFirst({
      where: { orderId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      success: true,
      data: this.mapPaymentResponse(payment),
      message: 'Payment retrieved successfully',
    };
  }
  private mapPaymentResponse(payment: {
    id: string;
    orderId: string;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string | null;
    transactionId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      currency: payment.currency,
      amount: payment.amount.toNumber(),

      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
