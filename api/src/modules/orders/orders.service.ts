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
import { OrderStatus } from 'prisma-client/client';

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

    const order = await this.prismaService.$transaction(async(tx) =>
        const newOrder = await tx.order.create({
            data:{
                userId,
                status: OrderStatus.PENDING,
                totalAmount : total,
                shippingAddress,
                cartId: latesCart?.id,
                orderItems:{
                    create : items.map((item) => ({
                        productId:item.productId,
                    }))
                }
            }
        })
    );
  }
}
