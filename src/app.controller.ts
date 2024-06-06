import { Controller, Get, Post, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Order } from './entities/orders.entity';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppService.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async create(): Promise<Order> {
    return this.appService.createOrder();
  }

  @EventPattern('order_completed')
  async handleOrderCompleted(data: { orderId: string; recipeId: string; recipeName: string }) {
    await this.appService.handleOrderCompleted(data);
  }
}
