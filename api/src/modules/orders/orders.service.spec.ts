import { Prisma } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrdersService authoritative pricing and inventory', () => {
  let db: ReturnType<typeof makeDatabase>;
  let service: OrdersService;
  function makeDatabase() {
    const models = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'product-1',
          isActive: true,
          price: new Prisma.Decimal('12.34'),
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
      },
      cart: { findFirst: jest.fn().mockResolvedValue(null) },
      payment: {
        findUnique: jest
          .fn<Promise<{ id: string } | null>, [unknown]>()
          .mockResolvedValue(null),
      },
      order: {
        create: jest.fn(
          ({
            data,
          }: {
            data: {
              totalAmount: Prisma.Decimal;
              orderItems: { create: { price: Prisma.Decimal }[] };
            };
          }) =>
            Promise.resolve({
              ...data,
              id: 'order-1',
              orderItems: [],
              user: null,
            }),
        ),
        findFirst: jest.fn().mockResolvedValue({
          id: 'order-1',
          status: 'PENDING',
          orderItems: [{ productId: 'product-1', quantity: 1 }],
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest
          .fn()
          .mockResolvedValue({ id: 'order-1', orderItems: [], user: null }),
      },
    };
    return {
      ...models,
      $transaction: jest.fn((fn: (tx: typeof models) => Promise<unknown>) =>
        fn(models),
      ),
    };
  }
  beforeEach(() => {
    db = makeDatabase();
    service = new OrdersService(db as unknown as PrismaService);
  });
  it('ignores submitted prices and snapshots database prices using decimal arithmetic', async () => {
    await service.create('user-1', {
      items: [{ productId: 'product-1', quantity: 2, price: 0.01 }],
      shippingAddress: 'Test address',
    });
    const created = db.order.create.mock.calls[0][0].data;
    expect(created.totalAmount.toString()).toBe('24.68');
    expect(created.orderItems.create[0].price.toString()).toBe('12.34');
  });
  it('merges duplicate products and reserves the combined quantity conditionally', async () => {
    await service.create('user-1', {
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-1', quantity: 3 },
      ],
      shippingAddress: 'Test',
    });
    expect(db.product.updateMany).toHaveBeenCalledTimes(1);
    expect(db.product.updateMany).toHaveBeenCalledWith({
      where: { id: 'product-1', isActive: true, stock: { gte: 5 } },
      data: { stock: { decrement: 5 } },
    });
  });
  it('rejects insufficient inventory without creating an order', async () => {
    db.product.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.create('user-1', {
        items: [{ productId: 'product-1', quantity: 2 }],
        shippingAddress: 'Test',
      }),
    ).rejects.toThrow('Insufficient stock');
    expect(db.order.create).not.toHaveBeenCalled();
  });
  it.each([0, -1, 1.5])('rejects invalid quantity %s', async (quantity) => {
    await expect(
      service.create('user-1', {
        items: [{ productId: 'product-1', quantity }],
        shippingAddress: 'Test',
      }),
    ).rejects.toThrow('positive integer');
  });
  it('does not allow customers to change order status', async () => {
    await expect(
      service.update('order-1', { status: 'PROCESSING' }, 'user-1'),
    ).rejects.toThrow('Customers cannot change');
  });
  it('does not release stock twice when cancellation loses a race', async () => {
    db.order.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.cancel('order-1', 'user-1')).rejects.toThrow(
      'active payment',
    );
    expect(db.product.update).not.toHaveBeenCalled();
  });
  it('does not cancel an order after a payment has been reserved', async () => {
    db.payment.findUnique.mockResolvedValue({ id: 'pay-1' });
    await expect(service.cancel('order-1', 'user-1')).rejects.toThrow(
      'active payment',
    );
    expect(db.product.update).not.toHaveBeenCalled();
  });
});
