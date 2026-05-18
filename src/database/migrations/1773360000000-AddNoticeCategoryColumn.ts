import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoticeCategoryColumn1773360000000 implements MigrationInterface {
  name = 'AddNoticeCategoryColumn1773360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notices"
      ADD COLUMN IF NOT EXISTS "category" varchar(30) NOT NULL DEFAULT 'NOTICE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notices"
      DROP COLUMN IF EXISTS "category"
    `);
  }
}
