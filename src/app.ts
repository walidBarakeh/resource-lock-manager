import express from 'express';
import bodyParser from 'body-parser';
import { ResourceRoute } from './routes/resourceRoutes';
import { handleErrorWithStatus } from './middleware/error.handler';
import { ResourceLockManager } from './services/ResourceLockManager';
import { IsAliveRoute } from './routes/isAlive';


export async function initApp(manager: ResourceLockManager){
const app = express();

app.use(bodyParser.json());

app.use('/api/resources', ResourceRoute(manager));
app.use(IsAliveRoute(manager));
app.use(handleErrorWithStatus);

return app
}

