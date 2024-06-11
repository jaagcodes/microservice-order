import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OrderService } from './services/order.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Order } from './entities/orders.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HealthCheckService } from './services/health-check.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(mikroOrmConfig),
    MikroOrmModule.forFeature([Order]),
    ClientsModule.registerAsync([
      {
        name: 'ORDER',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [OrderService, HealthCheckService],
})
export class AppModule {}
