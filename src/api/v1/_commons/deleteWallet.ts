import { db } from '../../../database/index.ts';
import { sql } from 'kysely';

type DeleteWalletType = {
    (
        type: 'savings' | 'budget',
        wallet_id: string,
    ): Promise<boolean>;
};

const deleteWallet: DeleteWalletType = async (type, wallet_id) => {
    const result = await db.transaction()
        .execute(async (tx) => {
            let query = tx
                .selectFrom('prosper.wallet_references')
                .select(
                    ({ eb }) => [
                        'prosper.wallet_references.id',
                        eb.cast(
                            'prosper.wallet_references.savings_wallet_id',
                            'text',
                        )
                            .as(
                                'savings_wallet_id',
                            ),
                        eb.cast(
                            'prosper.wallet_references.budget_wallet_id',
                            'text',
                        )
                            .as(
                                'budget_wallet_id',
                            ),
                    ],
                );

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

            const reference = await query.executeTakeFirst();

            if (!reference?.id) {
                return false;
            }

            await sql`
                delete from prosper.wallet_owners
                where wallet_reference_id = ${BigInt(reference.id)};
            `.execute(tx);

            await sql`
                delete from prosper.wallet_amounts
                where wallet_reference_id = ${BigInt(reference.id)};
            `.execute(tx);

            if (type === 'savings') {
                await sql`
                    delete from prosper.wallet_references
                    where id = ${BigInt(reference.id)};
                `.execute(tx);

                await sql`
                    delete from prosper.savings_metadata
                    where id = ${BigInt(reference.savings_wallet_id as string)};
                `.execute(tx);
            }

            if (type === 'budget') {
                await sql`
                    delete from prosper.wallet_references
                    where id = ${BigInt(reference.id)};
                `.execute(tx);

                await sql`
                    delete from prosper.budget_metadata
                    where id = ${BigInt(reference.budget_wallet_id as string)};
                `.execute(tx);
            }

            return true;
        });

    return result;
};

export default deleteWallet;
