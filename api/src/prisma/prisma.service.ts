import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Connected to database!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from database!');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Cannot clean database in development environment');
    }

    return this.$transaction([
      this.payment.deleteMany(),
      this.orderItem.deleteMany(),
      this.cartItem.deleteMany(),
      this.order.deleteMany(),
      this.cart.deleteMany(),
      this.product.deleteMany(),
      this.user.deleteMany(),
      this.category.deleteMany(),
    ]);
  }
}
