import { db } from '../../../database/index.ts';
import { sql } from 'kysely';

type UpdateWalletAmount = {
    (
        type: 'savings' | 'budget',
        wallet_id: string,
        amount: number,
    ): Promise<{ affectedRows: number; updatedAmount: number }>;
};

const updateWalletAmount: UpdateWalletAmount = async (
    type,
    wallet_id,
    amount,
) => {
    let query = db
        .selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_amounts.wallet_reference_id',
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
        ]);

    if (type === 'savings') {
        query = query.where(
            'savings_wallet_id',
            '=',
            wallet_id,
        );
    }

    if (type === 'budget') {
        query = query.where(
            'budget_wallet_id',
            '=',
            wallet_id,
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
