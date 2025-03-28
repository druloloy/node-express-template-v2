import { z } from 'zod';
import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
import { ProfileIdSchema } from '../../../utils/schema.ts';

type UpdateWalletAmount = {
    (
        params: {
            type: 'savings' | 'budget';
            wallet_id: string;
            amount: number;
            profile_id: z.infer<typeof ProfileIdSchema>;
        },
    ): Promise<{ affectedRows: number; updatedAmount: number }>;
};

const updateWalletAmount: UpdateWalletAmount = async (
    { type, wallet_id, amount, profile_id },
) => {
    let query = db
        .selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_amounts.wallet_reference_id',
            'prosper.wallet_references.id',
        )
        .innerJoin(
            'prosper.wallet_owners',
            'prosper.wallet_owners.wallet_reference_id',
            'prosper.wallet_references.id',
        )
        .select(({ eb }) => [
            eb.cast('prosper.wallet_references.id', 'text').as('reference_id'),
            eb.cast('prosper.wallet_references.savings_wallet_id', 'text').as(
                'savings_wallet_id',
            ),
            eb.cast('prosper.wallet_references.budget_wallet_id', 'text').as(
                'budget_wallet_id',
            ),
            'prosper.wallet_amounts.amount as original_amount',
            'prosper.wallet_owners.profile_id',
        ]);

    if (type === 'savings') {
        query = query.where((eb) =>
            eb.and([
                eb(
                    'savings_wallet_id',
                    '=',
                    wallet_id,
                ),
                eb(
                    'profile_id',
                    '=',
                    profile_id,
                ),
                eb.or([
                    eb(
                        'owner_type',
                        '=',
                        'creator',
                    ),
                    eb(
                        'owner_type',
                        '=',
                        'contributor',
                    ),
                ]),
            ])
        );
    }

    if (type === 'budget') {
        query = query.where((eb) =>
            eb.and([
                eb(
                    'budget_wallet_id',
                    '=',
                    wallet_id,
                ),
                eb(
                    'profile_id',
                    '=',
                    profile_id,
                ),
                eb.or([
                    eb(
                        'owner_type',
                        '=',
                        'creator',
                    ),
                    eb(
                        'owner_type',
                        '=',
                        'contributor',
                    ),
                ]),
            ])
        );
    }

    const [reference] = await query.execute();

    if (!reference?.reference_id) {
        return { affectedRows: 0, updatedAmount: 0 };
    }

    const result = await sql`
        update prosper.wallet_amounts
        set amount = ${BigInt(reference!.original_amount) + BigInt(amount)},
            updated_at = now()
        where prosper.wallet_amounts.wallet_reference_id = ${
        BigInt(reference?.reference_id as string)
    };
    `.execute(db);

    return {
        affectedRows: Number(result.numAffectedRows),
        updatedAmount: Number(reference!.original_amount) + amount,
    };
};

export default updateWalletAmount;
