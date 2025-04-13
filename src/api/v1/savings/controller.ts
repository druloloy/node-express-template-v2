import { Controller } from '../../../types.d.ts';
import ApiError from '../../../utils/ApiError.ts';
import { createResponse } from '../../../utils/response.ts';
import {
    ProfileIdSchema,
    SavingsMetadataInputSchema,
    WalletOwnersInputSchema,
} from '../../../utils/schema.ts';
import {
    createWallet,
    getAllUserSavings,
    getAllUserSavingsSummary,
} from './services.ts';
import deleteWallet from '../_commons/deleteWallet.ts';

import updateWalletAmount from '../_commons/updateWalletAmount.ts';

export const getAllSavings: Controller = async (req, res, next) => {
    const { profile } = req.user!;

    try {
        const result = await getAllUserSavings(
            profile.id as string,
        );

        return createResponse(res, {
            data: result,
            message: 'Fetched Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSavingsSummary: Controller = async (req, res, next) => {
    try {
        const { profile } = req.user!;

        const result = await getAllUserSavingsSummary(
            profile.id as string,
        );

        return createResponse(res, {
            data: result,
            message: 'Fetched Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};

export const createSavings: Controller = async (req, res, next) => {
    try {
        const {
            name,
            category_id,
            target_amount,
            target_date,
            preferred_currency_id,
            priority,
        } = req.body;

        const { profile } = req.user!;

        const [parsedWalletMetadata, parsedProfileId] = await Promise.all([
            await SavingsMetadataInputSchema
                .parseAsync({
                    name,
                    category_id,
                    target_amount,
                    target_date,
                    preferred_currency_id,
                    priority,
                }),
            await ProfileIdSchema.parseAsync(profile.id),
        ]);

        const result = await createWallet(
            {
                profile_id: parsedProfileId,
                walletData: parsedWalletMetadata,
                profile_name: profile.name,
                profile_username: profile.username,
            },
        );

        return createResponse(res, {
            data: result,
            message: 'Wallet Created Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};

// TODO: Add Ownership Verification. Only "creator" and "contributor" can update a wallet's amount.
// TODO: Register transaction and transaction snapshots
export const updateAmount: Controller = async (req, res, next) => {
    try {
        const { profile } = req.user!;
        const { amount } = req.body;
        const { wallet_id, action } = req.query;

        if (action !== 'add' && action !== 'subtract') {
            throw new ApiError(400, 'Invalid action');
        }

        const convertedAmount = (action === 'add' ? amount : -amount) * 100;
        const result = await updateWalletAmount(
            {
                type: 'savings',
                wallet_id: wallet_id as string,
                amount: convertedAmount,
                profile_id: profile.id,
                profile_name: profile.name,
                profile_username: profile.username,
            },
        );

        if (!result) {
            throw new ApiError(404, 'Wallet not found');
        }

        const isUpdated = result.affectedRows > 0;

        return createResponse(res, {
            data: {
                isUpdated,
                ...result,
            },
            message: 'Wallet Updated Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};

// TODO: Add Ownership Verification. Only "creator" can delete a wallet
export const removeWalletPermanently: Controller = async (req, res, next) => {
    try {
        try {
            const { profile } = req.user!;
            const { wallet_id } = req.query;

            const result = await deleteWallet({
                type: 'savings',
                wallet_id: wallet_id as string,
                profile_id: profile.id,
                profile_name: profile.name,
                profile_username: profile.username,
            });

            if (!result) {
                throw new ApiError(
                    400,
                    'Failed to delete wallet. Make sure you are the creator of this wallet.',
                );
            }

            return createResponse(res, {
                data: result,
                message: 'Wallet Deleted Successfully',
                status: 200,
            });
        } catch (error) {
            next(error);
        }
    } catch (error) {
        next(error);
    }
};
