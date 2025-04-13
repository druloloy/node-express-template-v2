import { z } from 'zod';
import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
import { ProfileIdSchema } from '../../../utils/schema.ts';
import { createTransaction } from './createTransaction.ts';

type DeleteWalletType = {
    (
        params: {
            type: 'savings' | 'budget';
            wallet_id: string;
            profile_id: z.infer<typeof ProfileIdSchema>;
            profile_name: string;
            profile_username: string;
        },
    ): Promise<boolean>;
};

const deleteWallet: DeleteWalletType = async ({
    type,
    wallet_id,
    profile_id,
    profile_name,
    profile_username,
}) => {
    const result = await db.transaction()
        .execute(async (tx) => {
            let query = tx
                .selectFrom('prosper.wallet_references')
                .innerJoin(
                    'prosper.wallet_owners',
                    'prosper.wallet_owners.wallet_reference_id',
                    'prosper.wallet_references.id',
                )
                .innerJoin(
                    'prosper.wallet_amounts',
                    'prosper.wallet_amounts.wallet_reference_id',
                    'prosper.wallet_references.id',
                )
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
                        'prosper.wallet_owners.profile_id',
                        'prosper.wallet_owners.owner_type',
                        'prosper.wallet_amounts.amount',
                    ],
                );

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
                        ]),
                    ])
                );
            }
            const reference = await query.executeTakeFirst();

            if (!reference?.id || reference?.owner_type !== 'creator') {
                return false;
            }

            await createTransaction({
                type,
                wallet_id,
                amount: Number(reference?.amount),
                action: 'delete',
                updated_by_name: `${profile_name} <${profile_username}>`,
                updated_by_id: profile_id,
                transaction: tx,
            });

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
