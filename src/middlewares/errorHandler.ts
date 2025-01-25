// @deno-types="npm:@types/express"

import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError.ts';
import { createResponse } from '../utils/response.ts';
import { ZodError } from 'zod';

const errorHandler = (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const error = { ...err };
    error.message = err.message;

    console.log(err);

    if (error.name === 'ZodError') {
        const message = (error as ZodError).issues[0].message;
        createResponse(res, {
            message,
            status: 400,
        });
    } else {
        createResponse(res, {
            message: err.message,
            status: err.status || 500,
        });
    }
};

export default errorHandler;
