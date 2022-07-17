import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { initial_db_structure } from '../SQL/initial_db_structure';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  return pgm.sql(initial_db_structure);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
  DROP TABLE users CASCADE;
  `);
}
