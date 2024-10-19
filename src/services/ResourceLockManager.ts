import { Knex } from 'knex';
import { ResourceLockDTO, ResourcesDto } from '../dto/ResourceLockDTO';
import { TimeQueryDTO } from '../dto/TimeQueryDTO';
import { validateOrReject } from 'class-validator';
import { RESOURCE_TABLE_NAME } from '../config/consts';
import { plainToInstance } from 'class-transformer';

enum CollisionStatus {
  Found = 'collision found',
  NotFound = 'no collision',
}

export class ResourceLockManager {
  constructor(private readonly client: Knex) {}
  public async addResourceLock(resourceId: string, startTime: number, endTime: number): Promise<void> {
    const dto = new ResourceLockDTO(resourceId, startTime, endTime);
    await validateOrReject(dto);

    await this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME).insert(dto);
  }

  public async bulkInsert(resources: ResourceLockDTO[]): Promise<void> {
    const resourcesDto = plainToInstance(ResourcesDto, { resources });
    await validateOrReject(resourcesDto);

    await this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME).insert(resources);
  }

  public async isLockedAt(resourceId: string, time: number): Promise<boolean> {
    const locks = await this.getLocksAt(resourceId, time);

    return locks.length > 0;
  }

  public async isThereCollisionAt(resourceId: string, time: number): Promise<boolean> {
    const locks = await this.getLocksAt(resourceId, time);

    return locks.length > 1;
  }

  private async getLocksAt(resourceId: string, time: number): Promise<ResourceLockDTO[]> {
    const dto = new TimeQueryDTO(resourceId, time);
    await validateOrReject(dto);

    return this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME)
      .where({ resourceId })
      .andWhere('startTime', '<=', time)
      .andWhere('endTime', '>', time)
      .returning('*');
  }

  public async getResources(resourceId: string): Promise<ResourceLockDTO[]> {
    return this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME)
      .where({ resourceId })
      .orderBy(['startTime', 'endTime'])
      .select('startTime', 'endTime');
  }

  public async findCollision(resourceId: string): Promise<{ status: CollisionStatus; collision?: [number, number] }> {
    const collisions = await this.findAllCollisions(resourceId, true);

    if (collisions.length > 0) {
      return { status: CollisionStatus.Found, collision: collisions[0] };
    }
    return { status: CollisionStatus.NotFound };
  }

  public async findAllCollisions(
    resourceId: string,
    firstCollision: boolean = false,
  ): Promise<Array<[number, number]>> {
    const locks = (await this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME)
      .where({ resourceId })
      .orderBy(['startTime', 'endTime'])
      .groupBy('startTime', 'endTime')
      .select('startTime', 'endTime', this.client.raw('count(*) as count'))) as {
      startTime: number;
      endTime: number;
      count: number;
    }[];

    if (locks.length === 0 || (locks.length === 1 && locks[0].count === 1)) {
      console.debug('no enough data to check collisions on', locks);
      return [];
    }
    const collisions: Array<[number, number]> = [];
    const active: Array<[number, number]> = [];

    for (const { startTime: currStart, endTime: currEnd, count } of locks) {
      while (active.length > 0 && active[0][1] <= currStart) {
        active.shift();
      }

      if (count > 1) {
        collisions.push([currStart, currEnd]);
        if (firstCollision) {
          return collisions;
        }
      }

      for (const [activeStart, activeEnd] of active) {
        if (currStart < activeEnd) {
          const overlapStart = Math.max(currStart, activeStart);
          const overlapEnd = Math.min(currEnd, activeEnd);
          collisions.push([overlapStart, overlapEnd]);

          if (firstCollision) {
            return collisions;
          }
        }
      }

      active.push([currStart, currEnd]);
    }

    return collisions;
  }

  public async checkDbConnection(): Promise<void> {
    await this.client.raw('select 1+1 as result');
  }
}
