import { Migration } from '@mikro-orm/migrations';

export class Migration20240606103530 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "order" add column "dish" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "order" drop column "dish";');
  }

}
