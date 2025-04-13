import { z } from 'zod';
import { ProfileIdSchema, TransactionSchema } from '../../../utils/schema.ts';
import { generateRandomID } from '../../../utils/gen-id.ts';
import { db } from '../../../database/index.ts';
import { Transaction } from 'kysely';
import { DB } from '../../../database/types.ts';

type CreateTransactionType = {
    (
        params: z.infer<typeof TransactionSchema> & {
            transaction: Transaction<DB>;
            amount?: number;
            category_id?: number;
            name?: string;
            preferred_currency_id?: number;
            wallet_owners?: string[];
        },
    ): Promise<void>;
};

const getWalletOwners = async (
    type: 'savings' | 'budget',
    walletId: string,
) => {
    const owners = await db.selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_owners',
            'prosper.wallet_references.id',
            'prosper.wallet_owners.wallet_reference_id',
        )
        .select(({ eb }) => [
            eb.cast('prosper.wallet_references.id', 'text').as('reference_id'),
            eb.cast('prosper.wallet_references.savings_wallet_id', 'text').as(
                'savings_wallet_id',
            ),
            eb.cast('prosper.wallet_references.budget_wallet_id', 'text').as(
                'budget_wallet_id',
            ),
            'prosper.wallet_owners.profile_id',
        ])
        .where((eb) =>
            eb.and([
                eb(
                    type === 'savings'
                        ? 'prosper.wallet_references.savings_wallet_id'
                        : 'prosper.wallet_references.budget_wallet_id',
                    '=',
                    walletId,
                ),
                eb('prosper.wallet_owners.wallet_type', '=', type),
            ])
        )
        .where((eb) =>
            eb.or([
                eb('prosper.wallet_owners.owner_type', '=', 'creator'),
                eb('prosper.wallet_owners.owner_type', '=', 'contributor'),
            ])
        )
        .execute();

    return owners.map((owner) => owner.profile_id);
};

const getMetadataAndAmount = async (
    walletId: string,
    type: 'savings' | 'budget',
) => {
    const metadataQuery = db.selectFrom(
        type === 'savings'
            ? 'prosper.savings_metadata'
            : 'prosper.budget_metadata',
    )
        .select(({ eb }) => [
            eb.cast(
                type === 'savings'
                    ? 'prosper.savings_metadata.id'
                    : 'prosper.budget_metadata.id',
                'text',
            ).as('id'),
            'category_id',
            'preferred_currency_id',
            'name',
        ])
        .where((eb) =>
            eb(
                type === 'savings'
                    ? 'prosper.savings_metadata.id'
                    : 'prosper.budget_metadata.id',
                '=',
                walletId,
            )
        );

    let amountQuery = db.selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_references.id',
            'prosper.wallet_amounts.wallet_reference_id',
        );

    if (type === 'budget') {
        amountQuery = amountQuery
            .select(({ eb }) => [
                eb.cast('prosper.wallet_references.budget_wallet_id', 'text')
                    .as(
                        'budget_wallet_id',
                    ),
                'amount',
            ])
            .where((eb) =>
                eb('prosper.wallet_references.budget_wallet_id', '=', walletId)
            );
    }

    if (type === 'savings') {
        amountQuery = amountQuery
            .select(({ eb }) => [
                eb.cast('prosper.wallet_references.savings_wallet_id', 'text')
                    .as(
                        'savings_wallet_id',
                    ),
                'amount',
            ])
            .where((eb) =>
                eb('prosper.wallet_references.savings_wallet_id', '=', walletId)
            );
    }

    const [metadata, amount] = await Promise.all([
        metadataQuery.executeTakeFirst(),
        amountQuery.executeTakeFirst() as Promise<{ amount: number }>,
    ]);

    return { ...metadata, amount: amount?.amount || 0 };
};

export const createTransaction: CreateTransactionType = async ({
    type,
    wallet_id,
    action,
    updated_by_name,
    updated_by_id,
    transaction,
    amount,
    category_id,
    name,
    preferred_currency_id,
    wallet_owners,
}) => {
    const snapshotId = generateRandomID('bigint');
    const recordsId = generateRandomID('bigint');

    const walletOwners = await getWalletOwners(type, wallet_id);

    const metadata = await getMetadataAndAmount(wallet_id, type);

    const snapshotQuery = transaction.insertInto(
        'prosper.transaction_snapshots',
    )
        .values({
            id: snapshotId,
            type,
            wallet_id,
            amount: amount!,
            updated_by_id,
            updated_by_name,
            wallet_category_id: metadata?.category_id || category_id!,
            wallet_name: metadata?.name || name!,
            wallet_currency_id: metadata?.preferred_currency_id ||
                preferred_currency_id!,
            wallet_owners:
                (walletOwners.length > 0 ? walletOwners : wallet_owners),
        });

    const recordsQuery = transaction.insertInto('prosper.transaction_records')
        .values({
            id: recordsId,
            snapshot_id: snapshotId,
            action,
            updated_by: updated_by_id,
        });

    await Promise.all([
        snapshotQuery.executeTakeFirst(),
        recordsQuery.executeTakeFirst(),
    ]);
};
