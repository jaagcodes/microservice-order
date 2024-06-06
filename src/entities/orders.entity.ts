import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
export class Order {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property()
  status: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ default: '' })
  dish: string = '';

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
