import request from 'supertest';
import { Knex } from 'knex';
import { Express } from 'express';
import { setupServer } from '../src/server'

let app: Express;
let dbClient: Knex;
describe('Resource Lock API Integration Tests', () => {

    const testResourceId = 'a'
    beforeAll(async () => {
        ({ app, dbClient } = await setupServer())
        await dbClient.migrate.latest();
    });

    afterAll(async () => {
        await dbClient.migrate.rollback();
        await dbClient.destroy()
    });

    test('POST /lock should create a new resource lock', async () => {
        const response = await request(app)
            .post('/api/resources/lock')
            .send({ resourceId: testResourceId, startTime: 1500, endTime: 1600 });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Resource lock added');
    });

    test('POST /lock should fail on invalid resource Id', async () => {
        const response = await request(app)
            .post('/api/resources/lock')
            .send({ resourceId: 1, startTime: 1500, endTime: 1600 });

        expect(response.status).toBe(400);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessage = JSON.parse((response.error as any)?.text);
        expect(errorMessage).toEqual({ error: { key: "resourceId", message: { isString: "resourceId must be a string" } } });
    });

    test('GET /api/resources/isLocked should return if resource is locked', async () => {
        const response = await request(app).get(`/api/resources/isLocked?resourceId=${testResourceId}&time=1550`);

        expect(response.status).toBe(200);
        expect(response.body.isLocked).toBe(true);
    });

    test('GET /api/resources/collision should return all collisions', async () => {
        await request(app)
            .post('/api/resources/lock')
            .send({ resourceId: testResourceId, startTime: 1550, endTime: 1650 });

        const response = await request(app).get(`/api/resources/collisions?resourceId=${testResourceId}`);

        expect(response.status).toBe(200);
        expect(response.body.collisions.length).toBeGreaterThan(0);
    });
});
