import { Controller, Get, Post, Logger, InternalServerErrorException, Query, Body } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { Order } from './entities/orders.entity';
import { EventPattern } from '@nestjs/microservices';
import { HealthCheckService } from './services/health-check.service';
import { PaginationQueryDto } from './dtos/pagination-query.dto';
import { CompleteOrderDto } from './dtos/complete-order.dto';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly healthCheckService: HealthCheckService,
  ) { }

  @Get('health')
    getHealthStatus(): string {
      try {
        this.logger.log('Checking health status');
        return this.healthCheckService.getHealthStatus();
      } catch (error) {
        this.logger.error('Error checking health status', error.stack);
        throw new InternalServerErrorException('Error checking health status');
      }
    }

  @Post()
  async create(): Promise<Order> {
    try {
      this.logger.log('Received request to create a new order');
      const order = await this.orderService.createOrder();
      this.logger.log(`Order created with ID ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('Error creating order', error.stack);
      throw new InternalServerErrorException('Error creating order');
    }
  }

  @Get('orders')
  async findAll(@Query() paginationQueryDto: PaginationQueryDto): Promise<{ data: Order[], total: number }> {
    try {
      this.logger.log('Received request to fetch all orders');
      return await this.orderService.findAllOrders(paginationQueryDto.page, paginationQueryDto.limit);
    } catch (error) {
      this.logger.error('Error fetching all orders', error.stack);
      throw new InternalServerErrorException('Error fetching all orders');
    }
  }

  @EventPattern('order_completed')
  async handleOrderCompleted(@Body() completeOrderDto: CompleteOrderDto) {
    try {
      this.logger.log(`Received order completion event for order ID ${completeOrderDto.orderId}`);
      await this.orderService.handleOrderCompleted(completeOrderDto);
      this.logger.log(`Order completion handled for order ID ${completeOrderDto.orderId}`);
    } catch (error) {
      this.logger.error('Error handling order completion', error.stack);
      throw error;
    }
  }
}
