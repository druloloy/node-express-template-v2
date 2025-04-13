import { sql } from 'kysely';
import { db } from '../../../database/index.ts';

const queryTransactions = async (profileId: string) => {
    const records = await db
        .selectFrom('prosper.transaction_snapshots')
        .innerJoin(
            'prosper.transaction_records',
            'prosper.transaction_snapshots.id',
            'prosper.transaction_records.snapshot_id',
        )
        .select(({ eb }) => [
            eb.cast('prosper.transaction_snapshots.id', 'text').as(
                'snapshot_id',
            ),
            eb.cast(
                'prosper.transaction_records.id',
                'text',
            ).as('record_id'),
            'prosper.transaction_records.action',
            'prosper.transaction_snapshots.type',
            'prosper.transaction_snapshots.wallet_id',
            'prosper.transaction_snapshots.amount',
            'prosper.transaction_snapshots.wallet_category_id',
            'prosper.transaction_snapshots.wallet_currency_id',
            'prosper.transaction_snapshots.wallet_name',
            'prosper.transaction_snapshots.updated_by_id',
            'prosper.transaction_snapshots.updated_by_name',
            'prosper.transaction_snapshots.created_at',
            'prosper.transaction_snapshots.wallet_owners',
        ])
        .where(({ ref }) =>
            sql`exists (
              select 1 from unnest(${ref('wallet_owners')}) as owner
              where owner = ${profileId}
            )`
        )
        .orderBy('prosper.transaction_records.created_at', 'desc')
        .execute();

    return records;
};

export const getUserTransactions = async (profile_id: string) => {
    return await queryTransactions(profile_id);
};
