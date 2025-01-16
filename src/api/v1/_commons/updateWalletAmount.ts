import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
// import { generateRandomID } from '../../../utils/gen-id.ts';

type UpdateWalletAmount = {
    (
        type: 'savings' | 'budget',
        wallet_id: string,
        amount: number,
    ): Promise<number>;
};

const updateWalletAmount: UpdateWalletAmount = async (
    type,
    wallet_id,
    amount,
) => {
    const query = db
        .selectFrom('prosper.wallet_references')
        .innerJoin(
            'prosper.wallet_amounts',
            'prosper.wallet_amounts.wallet_reference_id',
            'prosper.wallet_references.id',
        )
        .select([
            'prosper.wallet_references.id as reference_id',
            'prosper.wallet_amounts.amount as original_amount',
        ]);

    if (type === 'savings') {
        query.where(
            'prosper.wallet_references.savings_wallet_id',
            '=',
            wallet_id,
        );
    }

    if (type === 'budget') {
        query.where(
            'prosper.wallet_references.budget_wallet_id',
            '=',
            wallet_id,
        );
    }

    const reference = await query.executeTakeFirst();

    if (!reference?.reference_id) {
        return 0;
    }

    const result = await sql`
        update prosper.wallet_amounts
        set amount = ${BigInt(reference.original_amount) + BigInt(amount)},
            updated_at = now()
        where prosper.wallet_amounts.wallet_reference_id = ${
        BigInt(reference.reference_id)
    };
    `.execute(db);

    return Number(result.numAffectedRows) || 0;
};

export default updateWalletAmount;
