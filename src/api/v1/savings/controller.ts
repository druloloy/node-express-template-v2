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
    deleteWallet,
    getAllUserSavings,
    getAllUserSavingsSummary,
} from './services.ts';

import updateWalletAmount from '../_commons/updateWalletAmount.ts';

export const getAllSavings: Controller = async (req, res, next) => {
    const { profile_id } = req.query;

    if (!profile_id) {
        throw new ApiError(400, 'Profile ID is required');
    }

    try {
        const result = await getAllUserSavings(
            profile_id as string,
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
        const { profile_id } = req.query;

        const result = await getAllUserSavingsSummary(
            profile_id as string,
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
        console.log(req.body);

        const {
            name,
            category_id,
            target_amount,
            target_date,
            preferred_currency_id,
            priority,
        } = req.body;

        const { profile_id } = req.query;

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
            await ProfileIdSchema.parseAsync(profile_id),
        ]);

        const result = await createWallet(
            parsedProfileId,
            parsedWalletMetadata,
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
        const { amount, addFund } = req.body;
        const { wallet_id } = req.query;

        const convertedAmount = (addFund ? amount : -amount) * 100;
        const result = await updateWalletAmount(
            'savings',
            wallet_id as string,
            convertedAmount,
        );

        if (!result) {
            throw new ApiError(404, 'Wallet not found');
        }

        return createResponse(res, {
            data: { affectedRows: String(result) },
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
        const { wallet_id } = req.query;

        const result = await deleteWallet(wallet_id as string);

        if (!result) {
            throw new ApiError(500, 'Failed to delete wallet.');
        }

        return createResponse(res, {
            data: result,
            message: 'Wallet Deleted Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};
