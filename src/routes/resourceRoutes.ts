import { NextFunction, Response, Router, Request } from 'express';
import { ResourceLockManager } from '../services/ResourceLockManager';
import { ErrorCodes, InvalidParamsError } from '../config/consts';

export const ResourceRoute = (manager: ResourceLockManager) => {
  const router = Router();

  router.get('', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId } = req.query as unknown as { resourceId: string };
      if (!resourceId) {
        throw new InvalidParamsError('resourceId is missing');
      }
      const resources = await manager.getResources(resourceId);
      res.status(ErrorCodes.Ok).json(resources);
    } catch (e) {
      next(e);
    }
  });

  router.post('/lock', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId, startTime, endTime } = req.body as unknown as {
        resourceId: string;
        startTime: number;
        endTime: number;
      };
      await manager.addResourceLock(resourceId, startTime, endTime);
      res.status(ErrorCodes.Created).json({ message: 'Resource lock added' });
    } catch (e) {
      next(e);
    }
  });

  router.post('/bulkLocks', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resources } = req.body as unknown as {
        resources: {
          resourceId: string;
          startTime: number;
          endTime: number;
        }[];
      };
      await manager.bulkInsert(resources);
      res.status(ErrorCodes.Created).json({ message: 'Resources lock added' });
    } catch (e) {
      next(e);
    }
  });

  router.get('/isLocked', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId, time } = req.query as unknown as { resourceId: string; time: string };
      const isLocked = await manager.isLockedAt(resourceId, Number(time));
      res.status(ErrorCodes.Ok).json({ isLocked });
    } catch (e) {
      next(e);
    }
  });

  router.get('/isCollision', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId, time } = req.query as unknown as { resourceId: string; time: string };
      const isCollision = await manager.isThereCollisionAt(resourceId, Number(time));
      res.status(ErrorCodes.Ok).json({ isCollision });
    } catch (e) {
      next(e);
    }
  });

  router.get('/collisions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId } = req.query as unknown as { resourceId: string };

      if (!resourceId) {
        throw new InvalidParamsError('resourceId is missing');
      }
      const collisions = await manager.findAllCollisions(resourceId);
      res.status(ErrorCodes.Ok).json({ collisions });
    } catch (e) {
      next(e);
    }
  });

  router.get('/collision', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId } = req.query as unknown as { resourceId: string };

      if (!resourceId) {
        throw new InvalidParamsError('resourceId is missing');
      }
      const collision = await manager.findCollision(resourceId);
      res.status(ErrorCodes.Ok).json(collision);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
