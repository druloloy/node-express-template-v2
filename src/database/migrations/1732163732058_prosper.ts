import { Kysely, sql } from 'kysely';
import { DB } from '../types.ts';

export async function up(db: Kysely<DB>): Promise<void> {
    // Create schema
    await db.schema
        .createSchema('prosper')
        .execute()
        .then(() => console.log('Schema created successfully'))
        .catch((error) => console.error('Error creating schema:', error));

    // Create enum types first
    await sql`
        CREATE TYPE user_type AS ENUM ('admin', 'user');
        CREATE TYPE wallet_type AS ENUM ('budget', 'savings');
        CREATE TYPE owner_type AS ENUM ('contributor', 'viewer', 'creator');
        CREATE TYPE period_type AS ENUM ('daily', 'weekly', 'monthly', 'annually');
        CREATE TYPE transaction_action AS ENUM ('create', 'update', 'delete');
    `.execute(db)
        .then(() => console.log('Types created successfully'))
        .catch((error) => console.error('Error creating types:', error));

    // Create users table
    await db.schema
        .withSchema('prosper')
        .createTable('profiles')
        .addColumn('id', 'uuid', (col) => col.primaryKey())
        .addColumn('username', 'varchar(25)', (col) => col.notNull().unique())
        .addColumn('name', 'varchar(60)', (col) => col.notNull())
        .addColumn('profile_url', 'varchar(200)')
        .addColumn(
            'type',
            sql`user_type`,
            (col) => col.notNull().defaultTo('user'),
        )
        .addColumn(
            'auth_id',
            'uuid',
            (col) =>
                col.notNull()
                    .references('auth.users.id')
                    .onDelete('cascade'),
        )
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
        .execute()
        .then(() => console.log('Profiles table created successfully'))
        .catch((error) =>
            console.error('Error creating profiles table:', error)
        );

    // Create savings metadata table
    await db.schema
        .withSchema('prosper')
        .createTable('savings_metadata')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn('name', 'varchar(15)', (col) => col.notNull())
        .addColumn('category_id', 'integer', (col) =>
            col.notNull()
                .references('constants.categories.id')
                .onDelete('restrict'))
        .addColumn('target_amount', 'bigint', (col) => col.notNull())
        .addColumn('target_date', 'date', (col) => col.notNull())
        .addColumn('preferred_currency_id', 'integer', (col) =>
            col.notNull()
                .references('constants.currencies.id')
                .onDelete('restrict'))
        .addColumn('priority', 'boolean', (col) => col.defaultTo(false))
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
        .execute().then(() =>
            console.log('savings_metadata table created successfully')
        )
        .catch((error) =>
            console.error('Error creating savings_metadata table:', error)
        );

    // Create budget metadata table
    await db.schema
        .withSchema('prosper')
        .createTable('budget_metadata')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn('name', 'varchar(15)', (col) => col.notNull())
        .addColumn('category_id', 'integer', (col) =>
            col.notNull()
                .references('constants.categories.id')
                .onDelete('restrict'))
        .addColumn('assigned_amount', 'bigint', (col) => col.notNull())
        .addColumn('period', sql`period_type`, (col) => col.notNull())
        .addColumn('preferred_currency_id', 'integer', (col) =>
            col.notNull()
                .references('constants.currencies.id')
                .onDelete('restrict'))
        .addColumn(
            'refreshed_at',
            'timestamp',
            (col) => col.notNull().defaultTo(sql`now()`),
        )
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
        .execute().then(() =>
            console.log('budget_metadata table created successfully')
        )
        .catch((error) =>
            console.error('Error creating budget_metadata table:', error)
        );

    await db.schema
        .withSchema('prosper')
        .createTable('transaction_snapshots')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn('type', sql`wallet_type`, (col) => col.notNull())
        .addColumn('wallet_id', 'bigint', (col) => col.notNull())
        .addColumn('wallet_name', 'varchar(15)', (col) => col.notNull())
        .addColumn(
            'wallet_category_id',
            'integer',
            (col) => col.notNull().references('constants.categories.id'),
        )
        .addColumn(
            'wallet_currency_id',
            'integer',
            (col) => col.notNull().references('constants.currencies.id'),
        )
        .addColumn('wallet_owners', sql`uuid[]`, (col) => col.notNull())
        .addColumn('amount', 'bigint', (col) => col.notNull())
        .addColumn('updated_by_name', 'varchar(15)', (col) => col.notNull())
        .addColumn(
            'updated_by_id',
            'uuid',
            (col) =>
                col.notNull().references('prosper.profiles.id').onUpdate(
                    'cascade',
                ),
        )
        .addColumn(
            'created_at',
            'timestamp',
            (col) => col.notNull().defaultTo(sql`now()`),
        )
        .execute().then(() =>
            console.log('transaction_snapshots table created successfully')
        )
        .catch((error) =>
            console.error('Error creating transaction_snapshots table:', error)
        );

    await db.schema
        .withSchema('prosper')
        .createTable('transaction_records')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn(
            'snapshot_id',
            'bigint',
            (col) =>
                col.notNull().references('prosper.transaction_snapshots.id'),
        )
        .addColumn('action', sql`transaction_action`, (col) => col.notNull())
        .addColumn(
            'updated_by',
            'uuid',
            (col) =>
                col.notNull().references('prosper.profiles.id').onUpdate(
                    'cascade',
                ),
        )
        .addColumn(
            'created_at',
            'timestamp',
            (col) => col.notNull().defaultTo(sql`now()`),
        )
        .execute().then(() =>
            console.log('transaction_records table created successfully')
        )
        .catch((error) =>
            console.error('Error creating transaction_records table:', error)
        );

    // Create wallet reference
    await db.schema
        .withSchema('prosper')
        .createTable('wallet_references')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn(
            'savings_wallet_id',
            'bigint',
            (col) =>
                col.references('prosper.savings_metadata.id')
                    .onDelete(
                        'cascade',
                    ),
        )
        .addColumn(
            'budget_wallet_id',
            'bigint',
            (col) =>
                col.references('prosper.budget_metadata.id').onDelete(
                    'cascade',
                ),
        )
        .execute().then(() =>
            console.log('wallet_references table created successfully')
        )
        .catch((error) =>
            console.error('Error creating wallet_references table:', error)
        );

    // Create Wallet Amounts
    await db.schema
        .withSchema('prosper')
        .createTable('wallet_amounts')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn(
            'wallet_reference_id',
            'bigint',
            (col) =>
                col.notNull().references('prosper.wallet_references.id')
                    .onDelete(
                        'cascade',
                    ),
        )
        .addColumn('amount', 'bigint', (col) => col.notNull())
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
        .execute().then(() =>
            console.log('wallet_amounts table created successfully')
        )
        .catch((error) =>
            console.error('Error creating wallet_amounts table:', error)
        );

    // Create wallet owners table
    await db.schema
        .withSchema('prosper')
        .createTable('wallet_owners')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn(
            'profile_id',
            'uuid',
            (col) =>
                col.notNull().references('prosper.profiles.id').onDelete(
                    'restrict',
                ),
        )
        .addColumn('wallet_type', sql`wallet_type`, (col) => col.notNull())
        .addColumn('owner_type', sql`owner_type`, (col) => col.notNull())
        .addColumn(
            'wallet_reference_id',
            'bigint',
            (col) => col.notNull().references('prosper.wallet_references.id'),
        )
        .execute().then(() =>
            console.log('wallet_owners table created successfully')
        )
        .catch((error) =>
            console.error('Error creating wallet_owners table:', error)
        );

    // Create partner invitations table
    await db.schema
        .withSchema('prosper')
        .createTable('partner_invitations')
        .addColumn('id', 'bigint', (col) => col.primaryKey())
        .addColumn('type', sql`wallet_type`, (col) => col.notNull())
        .addColumn('wallet_id', 'bigint', (col) => col.notNull())
        .addColumn('nonce', 'bigint', (col) => col.notNull())
        .addColumn('expiration', 'date', (col) => col.notNull())
        .addColumn('sender_id', 'bigint', (col) => col.notNull())
        .addColumn('receiver_id', 'bigint', (col) => col.notNull())
        .execute().then(() =>
            console.log('partner_invitations table created successfully')
        )
        .catch((error) =>
            console.error('Error creating partner_invitations table:', error)
        );
}

export async function down(db: Kysely<DB>): Promise<void> {
    // Drop tables in reverse order of creation
    await db.schema
        .withSchema('prosper')
        .dropTable('partner_invitations')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('wallet_owners')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('wallet_amounts')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('wallet_references')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('transaction_records')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('transaction_snapshots')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('budget_metadata')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('savings_metadata')
        .execute();

    await db.schema
        .withSchema('prosper')
        .dropTable('profiles')
        .execute();

    // After all tables are dropped, drop the schema
    await sql`DROP SCHEMA IF EXISTS prosper CASCADE`.execute(db);

    // Drop enum types
    await sql`
        DROP TYPE IF EXISTS owner_type;
        DROP TYPE IF EXISTS wallet_type;
        DROP TYPE IF EXISTS user_type;
        DROP TYPE IF EXISTS period_type;
        DROP TYPE IF EXISTS transaction_type;
    `.execute(db);
}
