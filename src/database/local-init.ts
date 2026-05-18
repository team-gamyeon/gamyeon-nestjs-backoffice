import { AppDataSource } from './data-source.js';
import { seed } from './seeds/seed.js';

async function initializeLocalDb() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await AppDataSource.synchronize();
    await AppDataSource.destroy();

    await seed();
    console.log('Local DB bootstrap complete.');
  } catch (error) {
    console.error('Local DB bootstrap failed:', error);
    process.exit(1);
  }
}

void initializeLocalDb();
