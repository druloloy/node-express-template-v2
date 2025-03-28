import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
import { generateRandomID } from '../../../utils/gen-id.ts';

import {
    ProfileIdSchema,
    SavingsMetadataInputSchema,
    WalletOwnersInputSchema,
} from '../../../utils/schema.ts';
import { z } from 'zod';

const querySavingsByUser = (
    profile_id: z.infer<typeof ProfileIdSchema>,
) => {
    return db
        .selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_owners',
            'prosper.wallet_references.id',
            'prosper.wallet_owners.wallet_reference_id',
        )
        .innerJoin(
            'prosper.savings_metadata',
            'prosper.wallet_references.savings_wallet_id',
            'prosper.savings_metadata.id',
        )
        .innerJoin(
            'constants.categories',
            'prosper.savings_metadata.category_id',
            'constants.categories.id',
        )
        .innerJoin(
            'constants.currencies',
            'prosper.savings_metadata.preferred_currency_id',
            'constants.currencies.id',
        )
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_references.id',
            'prosper.wallet_amounts.wallet_reference_id',
        )
        .where('prosper.wallet_owners.wallet_type', '=', 'savings')
        .where('prosper.wallet_owners.profile_id', '=', profile_id);
};

export const getAllUserSavings = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
) => {
    return await querySavingsByUser(profile_id).select([
        sql`CAST(prosper.savings_metadata.id AS TEXT)`.as('id'),
        'prosper.savings_metadata.name',
        'prosper.savings_metadata.priority',
        'prosper.savings_metadata.target_amount',
        'prosper.savings_metadata.target_date',
        'constants.categories.name as category',
        'constants.currencies.code as currency',
        'prosper.wallet_amounts.amount',
        'prosper.wallet_amounts.updated_at',
        'prosper.wallet_amounts.created_at',
        'prosper.wallet_owners.profile_id',
        'prosper.wallet_owners.wallet_type',
        'prosper.wallet_owners.owner_type',
    ]).execute();
};

export const getAllUserSavingsSummary = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
) => {
    const totalAmount = await querySavingsByUser(profile_id)
        .select(({ fn }) => [
            fn.count('prosper.savings_metadata.id').as('wallet_count'),
            sql`ROUND(SUM(CAST(amount AS DECIMAL)) / 100, 2)`.as(
                'total_amount',
            ),
        ])
        .executeTakeFirst();

    const total = Number(totalAmount?.total_amount || 0);

    const statsByCat = await querySavingsByUser(profile_id)
        .select(({ fn }) => [
            'constants.categories.name as category',
            sql`ROUND(SUM(amount) / 100.0, 2)::numeric`.as(
                'amount',
            ),
            sql`ROUND(
                (SUM(amount) * 100.0 / ${total * 100})::numeric,
                2
              )`.as('percentage'),
            fn.count('prosper.savings_metadata.id').as('wallet_count'),
        ])
        .groupBy('category')
        .execute();

    const result = { ...totalAmount, statsByCat };

    return result;
};

export const createWallet = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
    walletData: z.infer<typeof SavingsMetadataInputSchema>,
) => {
    const {
        name,
        category_id,
        target_amount,
        target_date,
        preferred_currency_id,
        priority,
    } = walletData;

    const result = await db.transaction().execute(async (tx) => {
        const metadata_id = generateRandomID('bigint');
        const wallet_reference_id = generateRandomID('bigint');
        const wallet_amounts_id = generateRandomID('bigint');
        const wallet_owners_id = generateRandomID('bigint');

        // create savings_metadata
        await tx.insertInto('prosper.savings_metadata')
            .values({
                id: metadata_id,
                name,
                category_id,
                target_amount,
                target_date,
                preferred_currency_id,
                priority,
            })
            .executeTakeFirstOrThrow();

        // create wallet references
        await tx.insertInto('prosper.wallet_references')
            .values({
                id: wallet_reference_id,
                savings_wallet_id: metadata_id,
            })
            .executeTakeFirstOrThrow();
        // create wallet amounts: def 0
        await tx.insertInto('prosper.wallet_amounts')
            .values({
                id: wallet_amounts_id,
                wallet_reference_id,
                amount: 0,
            })
            .executeTakeFirstOrThrow();

        // create wallet owners
        await tx.insertInto('prosper.wallet_owners')
            .values({
                id: wallet_owners_id,
                wallet_reference_id,
                profile_id,
                owner_type: 'creator',
                wallet_type: 'savings',
            })
            .executeTakeFirstOrThrow();

        return {
            metadata_id,
            wallet_reference_id,
            wallet_amounts_id,
            wallet_owners_id,
        };
    });

    return result;
};
