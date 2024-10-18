import { initApp } from './app';
import { get } from 'env-var';
import Knex from 'knex';
import { dbConfig } from './config/knexFile';
import { ResourceLockManager } from './services/ResourceLockManager';

const PORT = get('PORT').default(7001).asIntPositive();
const ENV = get('ENV').default('development').asEnum(['development', 'test']);

async function setupServer() {
  try {
    const dbClient = Knex(dbConfig[ENV]);
    await dbClient.migrate.latest();

    console.log('Database seeded successfully.');
    const manager = new ResourceLockManager(dbClient);
    const app = await initApp(manager);
    return app;

  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  }
}

async function runServer() {
  const app = await setupServer();

  app.listen(PORT, () => console.log(`Resource Manager service has started on port ${PORT}.`));
}

void runServer();
