import 'dotenv/config';
import { loadConsulKvToEnv } from '../consul/consul-kv.loader.js';
import { loadSecretsManagerToEnv } from '../secrets/secrets-manager.loader.js';

async function run(): Promise<void> {
  await loadConsulKvToEnv();
  await loadSecretsManagerToEnv();

  const { AppDataSource } = await import('./data-source.js');

  await AppDataSource.initialize();
  try {
    const migrations = await AppDataSource.runMigrations();
    console.log(
      `[Migrations] Applied ${migrations.length} migration(s): ${migrations
        .map((migration) => migration.name)
        .join(', ')}`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error) => {
  console.error('[Migrations] Failed to run migrations:', error);
  process.exit(1);
});
