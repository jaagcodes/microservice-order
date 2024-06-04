import { Migration } from '@mikro-orm/migrations';

export class Migration20240604233147_Migration extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "order" ("id" uuid not null, "status" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "order_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "order" cascade;');
  }

}
