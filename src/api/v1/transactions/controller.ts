import { Controller } from '../../../types.d.ts';
import { createResponse } from '../../../utils/response.ts';
import { getUserTransactions } from './services.ts';

export const getTransactionsSummary: Controller = async (req, res, next) => {
    try {
        const { profile } = req.user!;

        const result = await getUserTransactions(profile.id);

        return createResponse(res, {
            data: result,
            message: 'Fetched Successfully',
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};
