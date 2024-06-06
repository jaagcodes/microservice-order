import { Migration } from '@mikro-orm/migrations';

export class Migration20240606104022 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "order" alter column "dish" type varchar(255) using ("dish"::varchar(255));');
    this.addSql('alter table "order" alter column "dish" set default \'\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "order" alter column "dish" drop default;');
    this.addSql('alter table "order" alter column "dish" type varchar(255) using ("dish"::varchar(255));');
  }

}
