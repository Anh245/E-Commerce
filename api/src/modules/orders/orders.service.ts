import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  Prisma,
  Product,
  User,
} from '@prisma/client';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  //create orders
  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const { items, shippingAddress } = createOrderDto;

    // Merge duplicate products before checking and reserving inventory.
    const quantities = new Map<string, number>();
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException('Quantity must be a positive integer');
      }
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }
    if (!quantities.size)
      throw new BadRequestException('Order must contain items');

    const order = await this.prismaService.$transaction(async (tx) => {
      const lines: {
        productId: string;
        quantity: number;
        price: Prisma.Decimal;
      }[] = [];
      let total = new Prisma.Decimal(0);
      // Consistent lock order reduces deadlocks between overlapping carts.
      for (const [productId, quantity] of [...quantities].sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });
        if (!product || !product.isActive) {
          throw new NotFoundException('Product is unavailable');
        }
        const reserved = await tx.product.updateMany({
          where: { id: productId, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (reserved.count !== 1)
          throw new BadRequestException('Insufficient stock');
        lines.push({ productId, quantity, price: product.price });
        total = total.plus(product.price.mul(quantity));
      }
      const cart = await tx.cart.findFirst({
        where: { userId, checkedOut: false },
        orderBy: { createdAt: 'desc' },
      });
      return tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount: total,
          shippingAddress,
          cartId: cart?.id,
          orderItems: { create: lines },
        },
        include: { orderItems: { include: { product: true } }, user: true },
      });
    });

    return this.wrap(order);
  }

  //find all orders for current user
  async findAll(
    userId: string,
    query: QueryOrderDto,
  ): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };

    if (status) where.status = status;
    if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }];

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.map(o)),
      total,
      page,
      limit,
    };
  }

  //find all orders (ADMIN API)
  async findAllForAdmin(query: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;

    if (search)
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          orderNumber: { contains: search, mode: 'insensitive' },
        },
      ];

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prismaService.order.count({ where }),
    ]);
    return {
      data: orders.map((o) => this.map(o)),
      total: total,
      page,
      limit,
    };
  }

  //Find Order by id
  async findOne(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;

    const order = await this.prismaService.order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.wrap(order);
  }

  //Update order by id
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    if (userId && updateOrderDto.status !== undefined) {
      throw new BadRequestException(
        'Customers cannot change payment or fulfillment status',
      );
    }
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;

    const existing = await this.prismaService.order.findFirst({
      where,
    });
    if (!existing) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const update = await this.prismaService.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return this.wrap(update);
  }

  //Cancel an order
  async cancel(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;

    const order = await this.prismaService.order.findFirst({
      where,
      include: {
        orderItems: true,
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const cancelled = await this.prismaService.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING, payments: { is: null } },
        data: { status: OrderStatus.CANCELLED },
      });
      if (claimed.count !== 1) {
        throw new BadRequestException(
          'Order is paid or has an active payment; contact support to cancel',
        );
      }
      if (await tx.payment.findUnique({ where: { orderId: id } })) {
        throw new BadRequestException(
          'Order has an active payment; contact support to cancel',
        );
      }
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
    });
    return this.wrap(cancelled);
  }

  private wrap(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderApiResponseDto<OrderResponseDto> {
    return {
      success: true,
      message: 'Order retreived successfully',
      data: this.map(order),
    };
  }

  private map(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: Number(order.totalAmount),
      shippingAddress: order.shippingAddress ?? '',
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),

      ...(order.user && {
        userEmail: order.user.email,
        userName:
          `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
      }),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
