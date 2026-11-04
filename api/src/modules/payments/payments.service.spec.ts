import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, Payment, Order } from '@prisma/client';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('stripe', () => jest.fn());

describe('PaymentsService payment integrity', () => {
  let service: PaymentsService;
  let db: ReturnType<typeof makeDatabase>;
  let stripe: ReturnType<typeof makeStripe>;
  let payment: Payment;
  let intent: Stripe.PaymentIntent;
  function makeStripe() {
    return {
      paymentIntents: {
        create: jest
          .fn<
            Promise<Stripe.PaymentIntent>,
            [Stripe.PaymentIntentCreateParams, Stripe.RequestOptions]
          >()
          .mockResolvedValue(intent),
        retrieve: jest
          .fn<Promise<Stripe.PaymentIntent>, [string]>()
          .mockResolvedValue(intent),
      },
      webhooks: {
        constructEvent: jest
          .fn<Stripe.Event, [Buffer, string, string]>()
          .mockReturnValue({
            type: 'payment_intent.succeeded',
            data: { object: intent },
          } as Stripe.Event),
      },
    };
  }
  function makeDatabase() {
    const models = {
      order: {
        findFirst: jest
          .fn<Promise<Order | null>, [unknown]>()
          .mockResolvedValue({
            id: 'order-1',
            userId: 'user-1',
            status: 'PENDING',
            totalAmount: new Prisma.Decimal('19.99'),
          } as Order),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'order-1',
          totalAmount: new Prisma.Decimal('19.99'),
          cartId: 'cart-1',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      payment: {
        findUnique: jest
          .fn()
          .mockImplementation(() => Promise.resolve(payment)),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(payment)),
        upsert: jest.fn().mockImplementation(() => Promise.resolve(payment)),
        update: jest.fn(({ data }: { data: Partial<Payment> }) =>
          Promise.resolve(Object.assign(payment, data)),
        ),
        updateMany: jest.fn(({ data }: { data: Partial<Payment> }) => {
          if (payment.status === 'SUCCESS')
            return Promise.resolve({ count: 0 });
          Object.assign(payment, data);
          return Promise.resolve({ count: 1 });
        }),
        findUniqueOrThrow: jest
          .fn()
          .mockImplementation(() => Promise.resolve(payment)),
      },
      cart: { update: jest.fn().mockResolvedValue({}) },
    };
    return {
      ...models,
      $transaction: jest.fn((fn: (tx: typeof models) => Promise<unknown>) =>
        fn(models),
      ),
    };
  }
  beforeEach(() => {
    payment = {
      id: 'pay-1',
      orderId: 'order-1',
      userId: 'user-1',
      amount: new Prisma.Decimal('19.99'),
      currency: 'usd',
      status: 'PENDING',
      transactionId: null,
      paymentMethod: 'STRIPE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    intent = {
      id: 'pi-1',
      amount: 1999,
      amount_received: 1999,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'test-secret',
      metadata: { orderId: 'order-1', userId: 'user-1', paymentId: 'pay-1' },
    } as Stripe.PaymentIntent;
    stripe = makeStripe();
    (Stripe as unknown as jest.Mock).mockImplementation(() => stripe);
    db = makeDatabase();
    service = new PaymentsService(db as unknown as PrismaService);
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_only';
  });
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('ignores client price and creates a USD intent from the persisted order total', async () => {
    const result = await service.createPaymentIntent('user-1', {
      orderId: 'order-1',
      amount: 0.01,
    });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1999,
        currency: 'usd',
        payment_method_types: ['card'],
      }),
      { idempotencyKey: 'payment-pay-1' },
    );
    expect(result.data.amount).toBe(19.99);
  });
  it('reuses the saved intent after retries instead of creating another charge', async () => {
    await service.createPaymentIntent('user-1', { orderId: 'order-1' });
    await service.createPaymentIntent('user-1', { orderId: 'order-1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi-1');
  });
  it('uses the same idempotency key for simultaneous create attempts', async () => {
    stripe.paymentIntents.create.mockImplementation(async () => {
      await Promise.resolve();
      return intent;
    });
    await Promise.all([
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ]);
    for (const call of stripe.paymentIntents.create.mock.calls)
      expect(call[1]).toEqual({ idempotencyKey: 'payment-pay-1' });
  });
  it('rejects another user’s order before calling Stripe', async () => {
    db.order.findFirst.mockResolvedValue(null);
    await expect(
      service.createPaymentIntent('other-user', { orderId: 'order-1' }),
    ).rejects.toThrow(NotFoundException);
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
  it('rejects canceled orders and orders below the supported USD minimum', async () => {
    db.order.findFirst.mockResolvedValueOnce({
      id: 'order-1',
      status: 'CANCELLED',
    } as Order);
    await expect(
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ).rejects.toThrow(BadRequestException);
    db.order.findFirst.mockResolvedValueOnce({
      id: 'order-1',
      status: 'PENDING',
      totalAmount: new Prisma.Decimal('.01'),
    } as Order);
    await expect(
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ).rejects.toThrow(BadRequestException);
  });
  it('does not create a fresh intent for an unresolved payment older than the idempotency window', async () => {
    payment.createdAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await expect(
      service.createPaymentIntent('user-1', { orderId: 'order-1' }),
    ).rejects.toThrow('reconciliation');
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
  it('settles payment, order and cart once across confirm and duplicate webhook delivery', async () => {
    payment.transactionId = 'pi-1';
    intent.status = 'succeeded';
    await service.confirmPayment(
      { orderId: 'order-1', paymentIntentId: 'pi-1' },
      'user-1',
    );
    await service.handleWebhook(Buffer.from('event'), 'test-signature');
    await service.handleWebhook(Buffer.from('event'), 'test-signature');
    expect(db.order.updateMany).toHaveBeenCalledTimes(1);
    expect(db.cart.update).toHaveBeenCalledTimes(1);
    expect(payment.status).toBe('SUCCESS');
  });
  it.each(['amount', 'currency', 'metadata', 'status', 'amount_received'])(
    'rejects mismatched intent %s',
    async (field) => {
      payment.transactionId = 'pi-1';
      intent.status = 'succeeded';
      switch (field) {
        case 'amount':
          intent.amount = 1;
          break;
        case 'currency':
          intent.currency = 'eur';
          break;
        case 'metadata':
          intent.metadata = { ...intent.metadata, userId: 'other' };
          break;
        case 'status':
          intent.status = 'processing';
          break;
        case 'amount_received':
          intent.amount_received = 1;
          break;
      }
      await expect(
        service.confirmPayment(
          { orderId: 'order-1', paymentIntentId: 'pi-1' },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(db.payment.updateMany).not.toHaveBeenCalled();
    },
  );
  it('rejects forged webhook signatures', async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    await expect(
      service.handleWebhook(Buffer.from('forged'), 'forged'),
    ).rejects.toThrow('Invalid webhook signature');
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('verifies a real Stripe test signature and rejects a changed raw body', async () => {
    const StripeSdk = jest.requireActual<typeof Stripe>('stripe');
    const real = new StripeSdk('sk_test_local_only');
    intent.status = 'succeeded';
    payment.transactionId = intent.id;
    const payload = JSON.stringify({
      id: 'evt_test',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: intent },
    });
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    const signature = real.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    stripe.webhooks.constructEvent.mockImplementation(
      (body, header, signingSecret) =>
        real.webhooks.constructEvent(body, header, signingSecret),
    );
    await service.handleWebhook(Buffer.from(payload), signature);
    expect(payment.status).toBe('SUCCESS');
    await expect(
      service.handleWebhook(Buffer.from(payload + ' '), signature),
    ).rejects.toThrow('Invalid webhook signature');
  });
  it('does not regress an order that cannot advance from PENDING', async () => {
    intent.status = 'succeeded';
    payment.transactionId = 'pi-1';
    db.order.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.confirmPayment(
        { orderId: 'order-1', paymentIntentId: 'pi-1' },
        'user-1',
      ),
    ).rejects.toThrow('reconciliation');
    expect(db.cart.update).not.toHaveBeenCalled();
  });
});
