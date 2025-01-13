import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.withSchema('constants')
		.createTable('categories')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar(25)', (col) => col.notNull().unique())
		.execute();

	await db.schema
		.withSchema('constants')
		.createTable('currencies')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('code', 'varchar(3)', (col) => col.notNull().unique())
		.addColumn('name', 'varchar(50)', (col) => col.notNull().unique())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.dropTable('constants.categories')
		.execute();

	await db.schema
		.dropTable('constants.currencies')
		.execute();
}
