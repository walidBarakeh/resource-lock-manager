import Knex from 'knex';
import { Knex  as knex} from 'knex';
import { ResourceLockManager } from '../src/services/ResourceLockManager';
import { dbConfig } from '../src/config/knexFile';

let dbClient: knex;
let manager: ResourceLockManager;

describe('ResourceLockManager', () => {

  const testResourceId = 'b'

  beforeAll(async () => {
    dbClient = Knex(dbConfig.test);
    await dbClient.migrate.latest();
  });

  beforeEach(async () => {

    manager = new ResourceLockManager(dbClient);
    await dbClient('resource_locks').truncate();
  });

  afterAll(async () => {
    await dbClient.destroy();
  });


  test('should add and persist locks', async () => {
    await manager.addResourceLock(testResourceId, 1500, 1600);
    const isLocked = await manager.isLockedAt(testResourceId, 1550);
    expect(isLocked).toBe(true);
  });

  test('should return false if resource is not locked at given time', async () => {
    await manager.addResourceLock(testResourceId, 1500, 1600);
    const isLocked = await manager.isLockedAt(testResourceId, 1700);
    expect(isLocked).toBe(false);
  });

  test('should detect no collisions for non-overlapping intervals', async () => {
    await manager.addResourceLock(testResourceId, 1500, 1600);
    await manager.addResourceLock(testResourceId, 1700, 1800);
    const collisions = await manager.findAllCollisions(testResourceId);
    expect(collisions.length).toBe(0);
  });

  test('should detect collisions for overlapping intervals', async () => {
    await manager.addResourceLock(testResourceId, 1500, 1600);
    await manager.addResourceLock(testResourceId, 1550, 1650);
    await manager.addResourceLock(testResourceId, 1600, 1650);
    await manager.addResourceLock(testResourceId, 1610, 1660);
    await manager.addResourceLock(testResourceId, 1650, 1700);
    const collisions = await manager.findAllCollisions(testResourceId);
    expect(collisions.length).toBe(4);
    expect(collisions[0]).toEqual([1550, 1600]);
  });
});
