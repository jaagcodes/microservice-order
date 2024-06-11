import { Controller, Get, Post, Logger, InternalServerErrorException, Query } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { Order } from './entities/orders.entity';
import { EventPattern } from '@nestjs/microservices';
import { HealthCheckService } from './services/health-check.service';

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
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Order[], total: number }> {
    try {
      this.logger.log('Received request to fetch all orders');
      return await this.orderService.findAllOrders(page, limit);
    } catch (error) {
      this.logger.error('Error fetching all orders', error.stack);
      throw new InternalServerErrorException('Error fetching all orders');
    }
  }

  @EventPattern('order_completed')
  async handleOrderCompleted(data: { orderId: string; recipeId: string; recipeName: string }) {
    try {
      this.logger.log(`Received order completion event for order ID ${data.orderId}`);
      await this.orderService.handleOrderCompleted(data);
      this.logger.log(`Order completion handled for order ID ${data.orderId}`);
    } catch (error) {
      this.logger.error('Error handling order completion', error.stack);
      throw error;
    }
  }
}
