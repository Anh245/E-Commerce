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
import { text } from 'node:stream/consumers';
import {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  User,
} from 'prisma-client/client';
import { QueryOrderDto } from './dto/query-order.dto';
import { contains } from 'class-validator';
import { retry, skip } from 'rxjs';
import { UsersService } from '../users/users.service';
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

    for (const item of items) {
      const product = await this.prismaService.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available:${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const latesCart = await this.prismaService.cart.findFirst({
      where: {
        userId,
        checkedOut: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const order = await this.prismaService.$transaction(
      async (
        tx,
      ): Promise<
        Order & { orderItems: (OrderItem & { product: Product })[]; user: User }
      > => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING,
            totalAmount: total,
            shippingAddress,
            cartId: latesCart?.id,
            orderItems: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
            user: true,
          },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return newOrder as Order & {
          orderItems: (OrderItem & { product: Product })[];
          user: User;
        };
      },
    );

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

    const where: any = { userId };

    if (status) where.status = status;
    if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }];

    const [orders, total] = await Promise.all([
      await this.prismaService.order.findMany({
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

    const where: any = {};

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
    const where: any = { id };
    if (userId) where.id = userId;

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
    const where: any = {};
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
    const where: any = {};
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
