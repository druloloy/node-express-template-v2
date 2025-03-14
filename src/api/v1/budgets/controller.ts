import { z } from 'zod';
import { Controller } from '../../../types.d.ts';
import ApiError from '../../../utils/ApiError.ts';
import { createResponse } from '../../../utils/response.ts';
import {
    getAllUserBudgets,
    getAllUserBudgetSummary,
    validateWalletPeriod,
} from './services.ts';
import {
    BudgetMetadataInputSchema,
    ProfileIdSchema,
} from '../../../utils/schema.ts';
import { createWallet } from './services.ts';
import updateWalletAmount from '../_commons/updateWalletAmount.ts';
import deleteWallet from '../_commons/deleteWallet.ts';

export const getAllBudgets: Controller = async (req, res, next) => {
    try {
        const { profile_id } = req.query;

        if (!profile_id) {
            throw new ApiError(400, 'Profile ID is required');
        }

        const result = await getAllUserBudgets(
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

export const getBudgetsSummary: Controller = async (req, res, next) => {
    try {
        const { profile_id, period } = req.query;

        if (!profile_id) {
            throw new ApiError(400, 'Profile ID is required');
        }

        const parsedProfileId = await ProfileIdSchema.parseAsync(profile_id);

        const result = await getAllUserBudgetSummary(
            parsedProfileId,
            period as z.infer<typeof BudgetMetadataInputSchema>['period'],
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

export const createBudget: Controller = async (req, res, next) => {
    try {
        const { profile_id } = req.query;
        const {
            assigned_amount,
            category_id,
            name,
            period,
            preferred_currency_id,
        } = req.body;

        if (!profile_id) {
            throw new ApiError(400, 'Profile ID is required');
        }

        const [parsedWalletMetadata, parsedProfileId] = await Promise.all([
            await BudgetMetadataInputSchema
                .parseAsync({
                    assigned_amount,
                    category_id,
                    name,
                    period,
                    preferred_currency_id,
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

export const validateBudget: Controller = async (req, res, next) => {
    try {
        const { wallet_id } = req.query;

        if (!wallet_id) {
            throw new ApiError(400, 'Wallet ID is required');
        }

        const result = await validateWalletPeriod(wallet_id as string);

        return createResponse(res, {
            data: result,
            message: 'Wallet Validated Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBudget: Controller = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const { wallet_id } = req.query;

        if (!wallet_id) {
            throw new ApiError(400, 'Wallet ID is required');
        }

        const result = await updateWalletAmount(
            'budget',
            wallet_id as string,
            amount || 0,
        );

        console.log(result);

        const isUpdated = result.affectedRows > 0;

        return createResponse(res, {
            data: {
                isUpdated,
                ...result,
            },
            message: isUpdated
                ? 'Wallet Updated Successfully'
                : 'Failed to update wallet',
            status: isUpdated ? 200 : 500,
        });
    } catch (error) {
        next(error);
    }
};

export const removeBudgetPermanently: Controller = async (req, res, next) => {
    try {
        try {
            const { wallet_id } = req.query;

            const result = await deleteWallet('budget', wallet_id as string);

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
    } catch (error) {
        next(error);
    }
};
