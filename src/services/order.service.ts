import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from '../entities/orders.entity';
import { CreateRequestContext, EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { CompleteOrderDto } from '../dtos/complete-order.dto';

@Injectable()
export class OrderService {

  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
    @Inject('ORDER') private readonly client: ClientProxy,
    private readonly em: EntityManager,
  ) { }

  async createOrder(): Promise<Order> {
    try {
      this.logger.log('Creating new order');
      const order = new Order();
      order.status = 'pending';
      await this.em.persistAndFlush(order);
      this.client.emit('order_created', { orderId: order.id });
      this.logger.log(`Order created with ID ${order.id}`);
      return order;
    } catch (error) {
      this.logger.log('Error creating order ', error.stack);
      throw new InternalServerErrorException('Error creating order');
    }
  }

  async findAllOrders(page: number, limit: number): Promise<{ data: Order[], total: number }> {
    try {
      this.logger.log('Fetching all orders');
      const [data, total] = await this.orderRepository.findAndCount({}, {
        limit,
        offset: (page - 1) * limit,
      });
      return { data, total };
    } catch (error) {
      this.logger.error('Error fetching all orders', error.stack);
      throw new InternalServerErrorException('Error fetching all orders');
    }
  }

  @CreateRequestContext()
  async handleOrderCompleted(completeOrderDto: CompleteOrderDto) {
    try {
      this.logger.log(`Handling order completion for order ID ${completeOrderDto.orderId}`);
      const order = await this.orderRepository.findOne({ id: completeOrderDto.orderId });
      if (!order) {
        this.logger.error(`Order with ID ${completeOrderDto.orderId} not found`);
        throw new NotFoundException(`Order with ID ${completeOrderDto.orderId} not found`);
      }
      order.status = 'completed';
      order.dish = completeOrderDto.recipeName;
      await this.em.persistAndFlush(order);
      this.logger.log(`Order with ID ${completeOrderDto.orderId} marked as completed`);
    } catch (error) {
      this.logger.error('Error handling order completion', error.stack);
      throw new InternalServerErrorException('Error handling order completion');
    }
  }
}


