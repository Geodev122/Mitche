import { databaseMigration } from '../utils/database-migration';

async function seed() {
  console.log('Starting commendation seeding script...');
  try {
    await databaseMigration.seedInitial();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

seed();
