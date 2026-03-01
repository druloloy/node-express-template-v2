import { Controller } from '../../../types.d.ts';
import { defaultRouterService } from './services.ts';
import { createResponse } from '../../../utils/response.ts';

export const defaultRouterController: Controller = async (_req, res, _next) => {
    const result = await defaultRouterService();

    return createResponse(res, {
        data: result,
        message: 'Success',
        status: 200,
    });
};
