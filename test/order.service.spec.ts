import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/services/order.service';
import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/postgresql';
import { Order } from '../src/entities/orders.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: EntityRepository<Order>;
  let clientProxy: ClientProxy;
  let em: EntityManager;
  let orm: MikroORM;

  beforeEach(async () => {
    orm = await MikroORM.init({
      entities: [Order],
      dbName: 'test',
      allowGlobalContext: true,
      connect: false, // Disable actual database connection
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            persistAndFlush: jest.fn(),
          },
        },
        {
          provide: 'ORDER',
          useValue: {
            emit: jest.fn().mockReturnValue(of({})),
          },
        },
        {
          provide: MikroORM,
          useValue: orm,
        },
        {
          provide: EntityManager,
          useValue: orm.em,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<EntityRepository<Order>>(getRepositoryToken(Order));
    clientProxy = module.get<ClientProxy>('ORDER');
    em = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const order = new Order();
      jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);
      jest.spyOn(clientProxy, 'emit').mockReturnValue(of({}));

      const result = await service.createOrder();

      expect(result).toBeInstanceOf(Order);
      expect(result.status).toBe('pending');
      expect(em.persistAndFlush).toHaveBeenCalledWith(result);
      expect(clientProxy.emit).toHaveBeenCalledWith('order_created', { orderId: result.id });
    });

    it('should throw an error if order creation fails', async () => {
      jest.spyOn(em, 'persistAndFlush').mockRejectedValue(new Error('Error creating order'));

      await expect(service.createOrder()).rejects.toThrow('Error creating order');
    });
  });

  describe('findAllOrders', () => {
    it('should return paginated orders', async () => {
      const orders = [new Order(), new Order()];
      const total = 2;
      jest.spyOn(orderRepository, 'findAndCount').mockResolvedValue([orders, total]);

      const result = await service.findAllOrders(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(orderRepository.findAndCount).toHaveBeenCalledWith({}, { limit: 10, offset: 0 });
    });

    it('should throw an error if fetching orders fails', async () => {
      jest.spyOn(orderRepository, 'findAndCount').mockRejectedValue(new Error('Error fetching all orders'));

      await expect(service.findAllOrders(1, 10)).rejects.toThrow('Error fetching all orders');
    });
  });

  describe('handleOrderCompleted', () => {
    it('should mark order as completed', async () => {
      const order = new Order();
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);
      jest.spyOn(em, 'persistAndFlush').mockResolvedValue(undefined);

      const data = { orderId: order.id, recipeId: 'recipe1', recipeName: 'Recipe 1' };
      await service.handleOrderCompleted(data);

      expect(order.status).toBe('completed');
      expect(order.dish).toBe('Recipe 1');
      expect(em.persistAndFlush).toHaveBeenCalledWith(order);
    });

    it('should throw NotFoundException if order is not found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      const data = { orderId: 'nonexistent', recipeId: 'recipe1', recipeName: 'Recipe 1' };

      await expect(service.handleOrderCompleted(data)).rejects.toThrow('Error handling order completion');
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(orderRepository, 'findOne').mockRejectedValue(new Error('Unexpected error'));

      const data = { orderId: 'order1', recipeId: 'recipe1', recipeName: 'Recipe 1' };

      await expect(service.handleOrderCompleted(data)).rejects.toThrow('Error handling order completion');
    });
  });
});
