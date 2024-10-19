import { get } from 'env-var';
import { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';

const debug = get('DEBUG').default('false').asBool();

export const dbConfig: { [key: string]: Knex.Config } = {
  development: knexStringcase({
    client: 'sqlite3',
    connection: {
      filename: './mydb.sqlite',
    },
    debug,
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations',
    },
  }),
  test: knexStringcase({
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    debug,
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations',
    },
  }),
};
