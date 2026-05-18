import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeBackofficeManagedTables1773740400000
  implements MigrationInterface
{
  name = 'NormalizeBackofficeManagedTables1773740400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "common_questions"
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamp NULL
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "common_questions"
      ALTER COLUMN "created_at" SET DEFAULT NOW()
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "common_questions"
      ALTER COLUMN "updated_at" SET DEFAULT NOW()
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "notices"
      ALTER COLUMN "created_at" SET DEFAULT NOW()
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "notices"
      ALTER COLUMN "updated_at" SET DEFAULT NOW()
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "notices"
      ALTER COLUMN "category" SET DEFAULT 'NOTICE'
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "notices"
      ALTER COLUMN "status" SET DEFAULT 'ACTIVE'
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "sanctions"
      ALTER COLUMN "created_at" SET DEFAULT NOW()
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'common_questions'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.sequences
          WHERE sequence_schema = 'public'
            AND sequence_name = 'common_questions_id_seq'
        ) THEN
          PERFORM setval(
            pg_get_serial_sequence('common_questions', 'id'),
            COALESCE((SELECT MAX(id) FROM common_questions), 1),
            true
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'notices'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.sequences
          WHERE sequence_schema = 'public'
            AND sequence_name = 'notices_id_seq'
        ) THEN
          PERFORM setval(
            pg_get_serial_sequence('notices', 'id'),
            COALESCE((SELECT MAX(id) FROM notices), 1),
            true
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'notice_images'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.sequences
          WHERE sequence_schema = 'public'
            AND sequence_name = 'notice_images_id_seq'
        ) THEN
          PERFORM setval(
            pg_get_serial_sequence('notice_images', 'id'),
            COALESCE((SELECT MAX(id) FROM notice_images), 1),
            true
          );
        END IF;
      END
      $$;
    `);
  }

  public async down(): Promise<void> {
    // Intentionally a no-op. This migration normalizes existing managed tables.
  }
}
