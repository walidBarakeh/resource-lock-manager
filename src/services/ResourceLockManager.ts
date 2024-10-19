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
    const locks = await this.client<ResourceLockDTO>(RESOURCE_TABLE_NAME)
      .where({ resourceId })
      .orderBy(['startTime', 'endTime'])
      .select('startTime', 'endTime');

    if (locks.length < 2) {
      return [];
    }
    const collisions: Array<[number, number]> = [];
    let previousLock = locks[0];
    for (let i = 1; i < locks.length; i++) {
      const currentLock = locks[i];

      if (this.overlaps([previousLock.startTime, previousLock.endTime], [currentLock.startTime, currentLock.endTime])) {
        const collision: [number, number] = [
          currentLock.startTime,
          Math.min(previousLock.endTime, currentLock.endTime),
        ];
        if (firstCollision) {
          return [collision];
        }
        collisions.push(collision);
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
  }
}
