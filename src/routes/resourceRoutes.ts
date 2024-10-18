import { NextFunction, Response, Router, Request } from 'express';
import { ResourceLockManager } from '../services/ResourceLockManager';
import { ErrorCodes } from '../config/consts';

export const ResourceRoute = (manager: ResourceLockManager) => {
    const router = Router();

    router.post('/lock', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { resourceId, startTime, endTime } = req.body as unknown as {
                resourceId: string; startTime: number;
                endTime: number;
            };
            await manager.addResourceLock(resourceId, startTime, endTime);
            res.status(ErrorCodes.Created).json({ message: 'Resource lock added' });
        } catch (e) {
            next(e);
        }
    });

    router.get('/isLocked', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { resourceId, time } = req.query as unknown as { resourceId: string; time: string; };
            const isLocked = await manager.isLockedAt(resourceId, Number(time));
            res.status(ErrorCodes.Ok).json({ isLocked });
        } catch (e) {
            next(e);
        }
    });

    router.get('/collisions', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { resourceId } = req.query as unknown as { resourceId: string };
            const collisions = await manager.findAllCollisions(resourceId);
            res.status(ErrorCodes.Ok).json({ collisions });
        } catch (e) {
            next(e);
        }
    });

    return router;
};
