import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
import { number, z } from 'zod';

import {
    BudgetMetadataInputSchema,
    ProfileIdSchema,
} from '../../../utils/schema.ts';
import { generateRandomID } from '../../../utils/gen-id.ts';
import isPeriodRefreshable from '../../../utils/period-refreshable.ts';
import { PeriodType } from '../../../database/types.ts';

const queryBudgetsByUser = (
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
            'prosper.budget_metadata',
            'prosper.wallet_references.budget_wallet_id',
            'prosper.budget_metadata.id',
        )
        .innerJoin(
            'constants.categories',
            'prosper.budget_metadata.category_id',
            'constants.categories.id',
        )
        .innerJoin(
            'constants.currencies',
            'prosper.budget_metadata.preferred_currency_id',
            'constants.currencies.id',
        )
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_references.id',
            'prosper.wallet_amounts.wallet_reference_id',
        )
        .where('prosper.wallet_owners.wallet_type', '=', 'budget')
        .where('prosper.wallet_owners.profile_id', '=', profile_id);
};

export const getAllUserBudgets = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
) => {
    return await queryBudgetsByUser(profile_id).select([
        sql`CAST(prosper.budget_metadata.id AS TEXT)`.as('id'),
        'prosper.budget_metadata.name',
        'prosper.budget_metadata.assigned_amount',
        'prosper.budget_metadata.period',
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

export const getAllUserBudgetSummary = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
    period: z.infer<typeof BudgetMetadataInputSchema>['period'] = 'daily',
) => {
    const wallets = await queryBudgetsByUser(profile_id)
        .where('prosper.budget_metadata.period', '=', period)
        .select([
            sql`CAST(prosper.budget_metadata.id AS TEXT)`.as('id'),
            'prosper.budget_metadata.name',
            'prosper.budget_metadata.assigned_amount',
            'prosper.budget_metadata.period',
            'constants.currencies.code as currency',
            'constants.categories.name as category',
            sql`ROUND(CAST(amount AS DECIMAL) / 100, 2)`.as(
                'amount',
            ),
            sql`ROUND((CAST(amount AS DECIMAL) / 100) / CAST(assigned_amount AS DECIMAL) * 100, 2)`
                .as(
                    'progress',
                ),
        ])
        .execute();
    const totalAssignedAmount = wallets.reduce(
        (acc, curr) => acc + Number(curr.assigned_amount),
        0,
    );

    return {
        wallets,
        totalAssignedAmount,
        totalExpenses: wallets.reduce(
            (acc, curr) => acc + Number(curr.amount),
            0,
        ),
    };
};

export const createWallet = async (
    profile_id: z.infer<typeof ProfileIdSchema>,
    walletData: z.infer<typeof BudgetMetadataInputSchema>,
) => {
    const {
        name,
        assigned_amount,
        category_id,
        period,
        preferred_currency_id,
    } = walletData;

    const result = await db.transaction().execute(async (tx) => {
        const metadata_id = generateRandomID('bigint');
        const wallet_reference_id = generateRandomID('bigint');
        const wallet_amounts_id = generateRandomID('bigint');
        const wallet_owners_id = generateRandomID('bigint');

        await tx.insertInto('prosper.budget_metadata')
            .values({
                id: metadata_id,
                name,
                category_id,
                assigned_amount,
                period,
                preferred_currency_id,
            })
            .executeTakeFirstOrThrow();

        // create wallet references
        await tx.insertInto('prosper.wallet_references')
            .values({
                id: wallet_reference_id,
                budget_wallet_id: metadata_id,
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
                wallet_type: 'budget',
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

export const validateWalletPeriod = async (wallet_id: string) => {
    const reference = await db
        .selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.budget_metadata',
            'prosper.wallet_references.budget_wallet_id',
            'prosper.budget_metadata.id',
        )
        .select(
            ({ eb }) => [
                'prosper.budget_metadata.refreshed_at',
                'prosper.budget_metadata.period',
                eb.cast(
                    'prosper.wallet_references.budget_wallet_id',
                    'text',
                )
                    .as(
                        'budget_wallet_id',
                    ),

                eb.cast(
                    'prosper.wallet_references.id',
                    'text',
                )
                    .as(
                        'id',
                    ),
            ],
        )
        .where(
            'prosper.wallet_references.budget_wallet_id',
            '=',
            wallet_id,
        )
        .executeTakeFirst();

    const period = reference?.period;
    const lastRefresh = reference?.refreshed_at;

    if (!isPeriodRefreshable(period!, new Date(lastRefresh!))) {
        return false;
    }

    // reset amount
    return await db.transaction().execute(async (tx) => {
        const updatedAmount = await tx.updateTable('prosper.wallet_amounts')
            .set({ amount: 0 })
            .where('wallet_reference_id', '=', reference!.id as string)
            .returning('amount')
            .executeTakeFirst();

        const updatedRefreshedAt = await tx.updateTable(
            'prosper.budget_metadata',
        )
            .set({ refreshed_at: new Date() })
            .where('id', '=', wallet_id)
            .executeTakeFirst();

        if (
            updatedRefreshedAt.numUpdatedRows == BigInt(0)
        ) {
            return false;
        }

        return true;
    });
};
