import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../../commmon/guards/role.guard';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from '../../commmon/decorators/custom-throttler.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
import { GetUser } from '../../commmon/decorators/get-user.decorator';
import { Role } from 'prisma-client/client';
import { Roles } from '../../commmon/decorators/roles.decorator';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //create orders
  @Post()
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Create a new order',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiCreatedResponse({
    description: 'Order create successfully',
    type: OrderApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data pr insufficent stock',
  })
  @ApiTooManyRequestsResponse({
    description: 'To many requests -rate limit exceeded',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.create(userId, createOrderDto);
  }

  //Get all orders
  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] Get all orders (paginated)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    description: 'List of orders ',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(OrderResponseDto),
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async findAllForAdmin(@Query() query: QueryOrderDto) {
    return await this.ordersService.findAllForAdmin(query);
  }

  //User Get own orders
  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get all orders for current user',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiOkResponse({
    description: 'List of all orders of user',
    type: PaginatedOrderResponseDto,
  })
  async findAll(@Query() query: QueryOrderDto, @GetUser('id') userId: string) {
    return await this.ordersService.findAll(userId, query);
  }

  //ADMIN: Get order by ID
  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] : Get order by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Orders details',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Admin access required',
  })
  async findOneAdmin(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  //Usern: Get own order by id
  @Get(':id')
  @ApiOperation({
    summary: 'Get an order by ID for current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.ordersService.findOne(id, userId);
  }

  //ADMIN update order
  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: '[ADMIN] update any order',
  })
  @ApiParam({
    name: 'id',
    description: ' Order Id',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'Order update successfully',
  })
  @ApiNotFoundResponse({
    description: 'order not found',
  })
  @ApiForbiddenResponse({
    description: ' Admin access required',
  })
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return await this.ordersService.update(id, dto);
  }

  //User update own order
  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Update your own order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiOkResponse({
    description: 'Order update successfully',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.update(id, dto, userId);
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: 'ADMIN cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN required',
  })
  async cancelAdmin(@Param('id') id: string) {
    return await this.ordersService.cancel(id);
  }

  //User cancel own order
  @Delete(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'user cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async cancel(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ordersService.cancel(id, userId);
  }
}
