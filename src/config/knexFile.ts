  import { get } from 'env-var';
import { Knex } from 'knex';

const debug = get('DEBUG').default('false').asBool();

export const dbConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './mydb.sqlite',
    },
    debug,
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations',
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './mydbTest.sqlite',
    },
    debug,
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations',
    },
  },
};
