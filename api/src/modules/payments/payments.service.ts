import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentStatus, Prisma } from '@prisma/client';
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

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const order = await this.prismaService.order.findFirst({
      where: { id: dto.orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    const completed = await this.prismaService.payment.findUnique({
      where: { orderId: order.id },
    });
    if (completed?.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        data: {
          paid: true,
          amount: Number(completed.amount),
          paymentId: completed.id,
        },
        message: 'Order already paid',
      };
    }
    if (order.status !== 'PENDING')
      throw new BadRequestException('Order is not awaiting payment');
    const amount = new Prisma.Decimal(order.totalAmount);
    const cents = amount.mul(100).toNumber();
    if (!Number.isSafeInteger(cents) || cents < 50) {
      throw new BadRequestException('USD order total must be at least 0.50');
    }
    // One local payment per order; client amount is deliberately ignored.
    const payment = await this.prismaService.$transaction(async (tx) => {
      const pending = await tx.order.updateMany({
        where: { id: order.id, userId, status: 'PENDING' },
        data: { status: 'PENDING' },
      });
      if (!pending.count)
        throw new BadRequestException('Order is no longer awaiting payment');
      return tx.payment.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          orderId: order.id,
          userId,
          amount,
          currency: 'usd',
          paymentMethod: 'STRIPE',
        },
      });
    });
    if (payment.status === PaymentStatus.SUCCESS)
      throw new BadRequestException('Order already paid');
    if (
      !new Prisma.Decimal(payment.amount).equals(amount) ||
      payment.currency !== 'usd'
    ) {
      throw new BadRequestException('Payment does not match order');
    }
    // Do not replay an unresolved create beyond Stripe's idempotency retention window.
    if (
      !payment.transactionId &&
      Date.now() - payment.createdAt.getTime() > 23 * 60 * 60 * 1000
    ) {
      throw new BadRequestException(
        'Unresolved payment requires reconciliation before retry',
      );
    }
    const intent = payment.transactionId
      ? await this.stripe.paymentIntents.retrieve(payment.transactionId)
      : await this.stripe.paymentIntents.create(
          {
            amount: cents,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: { orderId: order.id, userId, paymentId: payment.id },
          },
          { idempotencyKey: 'payment-' + payment.id },
        );
    await this.prismaService.payment.update({
      where: { id: payment.id },
      data: { transactionId: intent.id },
    });
    if (intent.status === 'succeeded') {
      await this.settlePayment(intent, userId);
      return {
        success: true,
        data: { paid: true, amount: amount.toNumber(), paymentId: payment.id },
        message: 'Order already paid',
      };
    }
    if (intent.status === 'canceled' || !intent.client_secret) {
      throw new BadRequestException(
        'Payment intent is unavailable; contact support',
      );
    }
    return {
      success: true,
      data: {
        clientSecret: intent.client_secret,
        paymentId: payment.id,
        amount: amount.toNumber(),
      },
      message: 'Payment intent ready',
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto, userId: string) {
    const payment = await this.prismaService.payment.findFirst({
      where: {
        orderId: dto.orderId,
        userId,
        transactionId: dto.paymentIntentId,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    const intent = await this.stripe.paymentIntents.retrieve(
      dto.paymentIntentId,
    );
    return this.settlePayment(intent, userId);
  }

  async handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret)
      throw new ServiceUnavailableException('Stripe webhook is not configured');
    if (!rawBody || !signature)
      throw new BadRequestException('Missing webhook signature or body');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      if (
        intent.metadata.orderId &&
        intent.metadata.userId &&
        intent.metadata.paymentId
      ) {
        await this.settlePayment(intent, intent.metadata.userId);
      }
    }
    return { received: true };
  }

  private async settlePayment(intent: Stripe.PaymentIntent, userId: string) {
    if (intent.status !== 'succeeded')
      throw new BadRequestException('Payment not successful');
    const payment = await this.prismaService.payment.findFirst({
      where: { orderId: intent.metadata.orderId, userId },
    });
    if (
      !payment ||
      intent.metadata.userId !== userId ||
      intent.metadata.paymentId !== payment.id ||
      (payment.transactionId && payment.transactionId !== intent.id) ||
      intent.currency !== payment.currency ||
      intent.amount !==
        new Prisma.Decimal(payment.amount).mul(100).toNumber() ||
      intent.amount_received !== intent.amount
    ) {
      throw new BadRequestException(
        'Payment identity, amount or currency mismatch',
      );
    }
    const updated = await this.prismaService.$transaction(async (tx) => {
      // Claim settlement atomically; duplicate callbacks/webhooks do not regress order state.
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: { not: PaymentStatus.SUCCESS } },
        data: { status: PaymentStatus.SUCCESS, transactionId: intent.id },
      });
      if (claimed.count) {
        const order = await tx.order.findUniqueOrThrow({
          where: { id: payment.orderId },
        });
        if (!new Prisma.Decimal(order.totalAmount).equals(payment.amount)) {
          throw new BadRequestException(
            'Order total changed; payment requires reconciliation',
          );
        }
        const advanced = await tx.order.updateMany({
          where: { id: order.id, userId, status: 'PENDING' },
          data: { status: 'PROCESSING' },
        });
        if (!advanced.count)
          throw new BadRequestException(
            'Order cannot be fulfilled; payment requires reconciliation',
          );
        if (order.cartId)
          await tx.cart.update({
            where: { id: order.cartId },
            data: { checkedOut: true },
          });
      }
      return tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
    });
    return {
      success: true,
      data: this.mapPaymentResponse(updated),
      message: 'Payment confirmed',
    };
  }

  async findAll(userId?: string): Promise<{
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
