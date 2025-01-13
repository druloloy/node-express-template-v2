import { defineConfig } from 'kysely-ctl';
import { dialect } from '../src/database/index.ts';

export default defineConfig({
    // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
    dialect,
    migrations: {
        migrationFolder: './src/database/migrations',
    },
    plugins: [],
    seeds: {
        seedFolder: './src/database/seeds',
    },
});
