import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoticeStatusColumn1773446400000 implements MigrationInterface {
  name = 'AddNoticeStatusColumn1773446400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notices"
      ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'ACTIVE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notices"
      DROP COLUMN IF EXISTS "status"
    `);
  }
}
