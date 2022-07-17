import fs from 'fs';
import path from 'path';

const tablesPath = path.resolve(__dirname, './TABLES.sql');

const tables = fs.readFileSync(tablesPath).toString();

export const initial_db_structure = tables;
