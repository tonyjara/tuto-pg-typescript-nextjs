import { randomBytes } from 'crypto';
import { default as migrate } from 'node-pg-migrate';
import { PoolConfig } from 'pg';
import format from 'pg-format';
import { myPool, pool } from './pool';

const test_user = process.env.NEXT_PUBLIC_PG_TEST_USER;

const root_config: PoolConfig = {
  host: 'localhost',
  port: 5432,
  database: 'test',
  user: test_user,
  password: '',
};

export const db_context = {
  roleName: () => {
    // Randomly generate a role name to connect to PG as
    return 'a' + randomBytes(4).toString('hex');
  },
  build: async (roleName: string) => {
    // Connect to PG as usual
    await myPool.connect(root_config);

    // Create new role
    await pool?.query(
      format('CREATE ROLE %I WITH LOGIN PASSWORD %L', roleName, roleName)
    );

    // Create a schema with the same name
    await pool?.query(
      format('CREATE SCHEMA %I AUTHORIZATION %I', roleName, roleName)
    );
    // Disconnect entirely from PG
    await pool?.end();

    // Run migrations in new schema
    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: root_config.host,
        port: root_config.port,
        database: root_config.database,
        user: roleName,
        password: roleName,
      },
      //@ts-ignore
      migrationsTable: undefined,
    });

    // Connect to pg as newly created role

    await myPool.connect({
      host: root_config.host,
      port: root_config.port,
      database: root_config.database,
      user: roleName,
      password: roleName,
    });
    return;
  },
  reset: async () => {
    await pool?.query('DELETE FROM users;');
    return;
  },
  close: async (roleName: string) => {
    // Disconnect from pg
    await pool?.end();

    // Reconnect as our root user
    await myPool.connect(root_config);

    // Delete the role and schema we created
    await pool?.query(format('DROP SCHEMA %I CASCADE;', roleName));
    await pool?.query(format('DROP ROLE %I;', roleName));

    // Disconnect
    return await pool?.end();
  },
};
