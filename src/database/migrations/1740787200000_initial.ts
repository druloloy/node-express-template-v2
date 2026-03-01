import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<never>): Promise<void> {
    await db.schema
        .createTable('users')
        .addColumn('id', 'uuid', (col) => col.primaryKey())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('name', 'varchar(100)', (col) => col.notNull())
        .addColumn(
            'created_at',
            'timestamp',
            (col) => col.notNull().defaultTo(sql`now()`),
        )
        .addColumn(
            'updated_at',
            'timestamp',
            (col) => col.notNull().defaultTo(sql`now()`),
        )
        .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
    await db.schema.dropTable('users').execute();
}
