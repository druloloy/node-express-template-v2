import { Controller } from '../../../types.d.ts';
import { defaultRouterService } from './controllers.ts';
import { createResponse } from '../../../utils/response.ts';

export const defaultRouterController: Controller = async (req, res, next) => {
    const result = await defaultRouterService();

    return createResponse(res, {
        data: result,
        message: 'Default Router Service',
        status: 200,
    });
};
