import Knex from 'knex';
import { Knex  as knex} from 'knex';
import { ResourceLockManager } from '../src/services/ResourceLockManager';
import { dbConfig } from '../src/config/knexFile';

let dbClient: knex;
let manager: ResourceLockManager;
describe('ResourceLockManager', () => {

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
    await manager.addResourceLock('a', 1500, 1600);
    const isLocked = await manager.isLockedAt('a', 1550);
    expect(isLocked).toBe(true);
  });

  test('should return false if resource is not locked at given time', async () => {
    await manager.addResourceLock('a', 1500, 1600);
    const isLocked = await manager.isLockedAt('a', 1700);
    expect(isLocked).toBe(false);
  });

  test('should detect no collisions for non-overlapping intervals', async () => {
    await manager.addResourceLock('a', 1500, 1600);
    await manager.addResourceLock('a', 1700, 1800);
    const collisions = await manager.findAllCollisions('a');
    expect(collisions.length).toBe(0);
  });

  test('should detect collisions for overlapping intervals', async () => {
    await manager.addResourceLock('a', 1500, 1600);
    await manager.addResourceLock('a', 1550, 1650);
    const collisions = await manager.findAllCollisions('a');
    expect(collisions.length).toBe(1);
    expect(collisions[0]).toEqual([1550, 1600]);
  });
});
