import { z } from 'zod';
import { Controller } from '../../../types.d.ts';
import ApiError from '../../../utils/ApiError.ts';
import { createResponse } from '../../../utils/response.ts';
import { getAllUserBudgets, getAllUserBudgetSummary } from './services.ts';
import { BudgetMetadataInputSchema } from '../../../utils/schema.ts';

export const getAllBudgets: Controller = async (req, res, next) => {
    const { profile_id } = req.query;

    if (!profile_id) {
        throw new ApiError(400, 'Profile ID is required');
    }

    try {
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
}

export const getBudgetsSummary: Controller = async (req, res, next) => {
        const { profile_id, period } = req.query;

        if (!profile_id) {
            throw new ApiError(400, 'Profile ID is required');
        }

        try {
            const result = await getAllUserBudgetSummary(
                profile_id as string,
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
}