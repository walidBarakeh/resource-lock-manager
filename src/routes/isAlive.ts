import { NextFunction, Response, Router, Request } from 'express';
import { ResourceLockManager } from '../services/ResourceLockManager';
import { ErrorCodes } from '../config/consts';
import packageJson from '../../package.json';

export const IsAliveRoute = (manager: ResourceLockManager) => {
  const router = Router();

  router.get('/is_alive', async (_: Request, res: Response, next: NextFunction) => {
    const response = await isAlive(manager);
    res.status(response.alive ? ErrorCodes.Ok : ErrorCodes.InternalServerError).json(response);
    next();
  });

  return router;
};



const isAlive = async (manager: ResourceLockManager) => {

  const npmVersion = packageJson.version;

  let dbConnected = false;
  try {
    await manager.checkDbConnection();
    dbConnected = true;
  } catch { }

  return {
    alive: dbConnected,
    dbConnected: dbConnected,
    version: npmVersion,
    nodeVersion: process.version,
  };
}