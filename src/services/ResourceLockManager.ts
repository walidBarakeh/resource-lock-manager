import { Knex } from 'knex'
import { ResourceLockDTO } from '../dto/ResourceLockDTO';
import { TimeQueryDTO } from '../dto/TimeQueryDTO';
import { validateOrReject } from 'class-validator';
import { RESOURCE_TABLE_NAME } from '../config/consts';

export class ResourceLockManager {
  constructor(private readonly client: Knex) {
  }
  public async addResourceLock(resourceId: string, startTime: number, endTime: number): Promise<void> {
    const dto = new ResourceLockDTO(resourceId, startTime, endTime);
    await validateOrReject(dto);

    await this.client(RESOURCE_TABLE_NAME).insert({
      resource_id: resourceId,
      start_time: startTime,
      end_time: endTime,
    });
  }

  public async isLockedAt(resourceId: string, time: number): Promise<boolean> {
    const dto = new TimeQueryDTO(resourceId, time);
    await validateOrReject(dto);

    const lock = await this.client(RESOURCE_TABLE_NAME)
      .where({ resource_id: resourceId })
      .andWhere('start_time', '<=', time)
      .andWhere('end_time', '>', time)
      .first();

    return !!lock;
  }

  public async findAllCollisions(resourceId: string): Promise<Array<[number, number]>> {
    const locks = await this.client(RESOURCE_TABLE_NAME)
      .where({ resource_id: resourceId })
      .orderBy(['start_time', 'end_time']).select('start_time as startTime','end_time as endTime') as {startTime: number; endTime: number}[];

    const collisions: Array<[number, number]> = [];
    let previousLock = locks[0];
    for (let i = 1; i < locks.length; i++) {
      const currentLock = locks[i];
  
      if (this.overlaps([previousLock.startTime, previousLock.endTime], [currentLock.startTime, currentLock.endTime])) {
        collisions.push([
          Math.max(previousLock.startTime, currentLock.startTime),
          Math.min(previousLock.endTime, currentLock.endTime),
        ]);
      }

      previousLock = currentLock;
    }
    
    return collisions;
  }

  private overlaps([start1, end1]: [number, number], [start2, end2]: [number, number]): boolean {
    return start1 < end2 && start2 < end1;
  }

  public async checkDbConnection(): Promise<void> {
    await this.client.raw('select 1+1 as result');
  };
}

