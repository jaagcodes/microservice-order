import 'dotenv/config';
import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: MikroOrmModuleOptions = {
  extensions: [Migrator],
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  driver: PostgreSqlDriver,
  driverOptions: {
    connection: { ssl: true },
  },
  migrations: {
    path: './src/migrations',
    disableForeignKeys: false,
  },
  debug: true,
};

export default config;
