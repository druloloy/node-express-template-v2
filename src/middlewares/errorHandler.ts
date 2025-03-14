// @deno-types="npm:@types/express"

import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError.ts';
import { createResponse } from '../utils/response.ts';
import { ZodError } from 'zod';

const errorHandler = (
    err: Error & { status?: number; code?: number | string; detail?: string },
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const error = { ...err };
    error.message = err.message;

    console.error(err);

    if (error.name === 'ZodError') {
        const message = (error as ZodError).issues[0].message;
        createResponse(res, {
            message,
            status: 400,
        });
    } else if (
        /Key \(profile_id\)=\([0-9a-f-]+\) is not present in table "profiles"\./
            .test(error?.detail || '')
    ) {
        console.error('Invalid profile id');
        const message = 'Please check if the profile ID is correct.';
        createResponse(res, {
            message,
            status: 400,
        });
    } else {
        console.error(error.name, error.code);
        createResponse(res, {
            message: err.message,
            status: err.status || 500,
        });
    }
};

export default errorHandler;
