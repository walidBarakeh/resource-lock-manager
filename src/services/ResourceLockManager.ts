import { Knex } from 'knex'
import { ResourceLockDTO } from '../dto/ResourceLockDTO';
import { TimeQueryDTO } from '../dto/TimeQueryDTO';
import { validateOrReject } from 'class-validator';

export class ResourceLockManager {
  constructor(private readonly client: Knex) {
  }
  public async addResourceLock(resourceId: string, startTime: number, endTime: number): Promise<void> {
    const dto = new ResourceLockDTO(resourceId, startTime, endTime);
    await validateOrReject(dto);

    await this.client('resource_locks').insert({
      resource_id: resourceId,
      start_time: startTime,
      end_time: endTime,
    });
  }

  public async isLockedAt(resourceId: string, time: number): Promise<boolean> {
    const dto = new TimeQueryDTO(resourceId, time);
    await validateOrReject(dto);

    const lock = await this.client('resource_locks')
      .where({ resource_id: resourceId })
      .andWhere('start_time', '<=', time)
      .andWhere('end_time', '>', time)
      .first();

    return !!lock;
  }

  public async findAllCollisions(resourceId: string): Promise<Array<[number, number]>> {
    const locks = await this.client('resource_locks')
      .where({ resource_id: resourceId })
      .orderBy('start_time', 'asc');

    const collisions: Array<[number, number]> = [];
    for (let i = 0; i < locks.length; i++) {
      for (let j = i + 1; j < locks.length; j++) {
        if (this.overlaps([locks[i].start_time, locks[i].end_time], [locks[j].start_time, locks[j].end_time])) {
          collisions.push([
            Math.max(locks[i].start_time, locks[j].start_time),
            Math.min(locks[i].end_time, locks[j].end_time),
          ]);
        }
      }
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

