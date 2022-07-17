import pg from 'pg';

let pool = null as pg.Pool | null;

const host = process.env.PG_HOST;
const port = Number(process.env.PG_PORT);
const database = process.env.PG_DB_NAME;
const user = process.env.PG_USER;
const password = process.env.PG_PASS;

export const poolConfig: pg.PoolConfig = {
  host,
  port,
  database,
  user,
  password,
};

const myPool = {
  connect: async (options: pg.PoolConfig) => {
    pool = new pg.Pool(options);
    await pool.query('SELECT 1 + 1;');
    return;
  },
};

if (!pool) {
  myPool.connect(poolConfig);
}

export { myPool, pool };
