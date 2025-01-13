// @deno-types="npm:@types/pg"

import pg from 'pg';
import { DeduplicateJoinsPlugin, Kysely, PostgresDialect } from 'kysely';
import appConfig from '../../.config/app.config.ts';
import { DB } from './types.ts';
const { Pool, types } = pg;

// int8 to number
types.setTypeParser(20, (val) => {
    return parseInt(val, 10);
});

// decimal to number
types.setTypeParser(1700, (val) => {
    return parseFloat(val);
});

export const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: appConfig.databaseUrl,
        max: 10,
    }),
});

export const db = new Kysely<DB>({
    dialect,
    plugins: [new DeduplicateJoinsPlugin()],
});
