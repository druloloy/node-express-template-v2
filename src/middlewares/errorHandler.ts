// @deno-types="npm:@types/express"

import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.ts';
import { createResponse } from '../utils/response.ts';

const errorHandler = (
    err: Error & { status?: number; code?: number | string },
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.error(err);

    if (err instanceof ZodError) {
        return createResponse(res, {
            message: err.issues[0].message,
            status: 400,
        });
    }

    return createResponse(res, {
        message: err.message || 'Internal Server Error',
        status: (err as ApiError).status || 500,
    });
};

export default errorHandler;
