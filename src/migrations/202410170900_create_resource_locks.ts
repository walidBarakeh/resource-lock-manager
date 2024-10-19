import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('resource_locks', (table) => {
    table.increments('id').primary();
    table.string('resource_id').notNullable();
    table.integer('start_time').notNullable();
    table.integer('end_time').notNullable();

    table.index(['resource_id'], 'idx_resource_id');
    table.index(['resource_id', 'start_time', 'end_time'], 'idx_resource_id_times');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('resource_locks');
}
