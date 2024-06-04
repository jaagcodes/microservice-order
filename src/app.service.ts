import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './entities/orders.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
    @Inject('ORDER') private readonly client: ClientProxy,
    private readonly em: EntityManager,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createOrder(): Promise<Order> {
    const order = new Order();
    order.status = 'pending';
    await this.em.persistAndFlush(order);

    this.client.emit('order_created', { orderId: order.id });

    return order;
  }
}
