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
import { verifyAccessToken } from '../../../utils/auth.ts';
import { access } from 'node:fs';

export const getAllBudgets: Controller = async (req, res, next) => {
    try {
        const { profile } = req.user!;

        const result = await getAllUserBudgets(
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

export const getBudgetsSummary: Controller = async (req, res, next) => {
    try {
        const { profile } = req.user!;
        const { period } = req.query;

        const parsedProfileId = await ProfileIdSchema.parseAsync(profile.id);

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
        const { profile } = req.user!;
        const {
            assigned_amount,
            category_id,
            name,
            period,
            preferred_currency_id,
        } = req.body;

        const [parsedWalletMetadata, parsedProfileId] = await Promise.all([
            await BudgetMetadataInputSchema
                .parseAsync({
                    assigned_amount,
                    category_id,
                    name,
                    period,
                    preferred_currency_id,
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
        const { profile } = req.user!;
        const { amount } = req.body;
        const { wallet_id, action } = req.query;

        if (!wallet_id) {
            throw new ApiError(400, 'Wallet ID is required');
        }

        if (action !== 'add' && action !== 'subtract') {
            throw new ApiError(400, 'Invalid action');
        }

        const convertedAmount = (action === 'add' ? amount : -amount) * 100;

        const result = await updateWalletAmount(
            {
                amount: convertedAmount,
                type: 'budget',
                profile_id: profile.id as string,
                wallet_id: wallet_id as string,
                profile_name: profile.name,
                profile_username: profile.username,
            },
        );

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
            const { profile } = req.user!;
            const { wallet_id } = req.query;

            const result = await deleteWallet({
                type: 'budget',
                wallet_id: wallet_id as string,
                profile_id: profile.id as string,
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
