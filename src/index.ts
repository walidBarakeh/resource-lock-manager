import { get } from 'env-var';
import { setupServer } from './server';

const PORT = get('PORT').default(7001).asIntPositive();

async function runServer() {
  const { app } = await setupServer();

  app.listen(PORT, () => console.log(`Resource Manager service has started on port ${PORT}.`));
}

void runServer();
