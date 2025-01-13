// @deno-types="npm:@types/express"

import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError.ts';
import { createResponse } from '../utils/response.ts';

const errorHandler = (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        const message = 'Address not found!';
        error = new ApiError(404, message);
    }

    return createResponse(res, {
        message: err.message,
        status: err.status || 500,
    });
};

export default errorHandler;
