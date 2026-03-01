// @deno-types="npm:@types/express"
import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type ValidateSchemas = {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
};

const validate = (schemas: ValidateSchemas) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (schemas.body) schemas.body.parse(req.body);
        if (schemas.query) schemas.query.parse(req.query);
        if (schemas.params) schemas.params.parse(req.params);
        next();
    };
};

export default validate;
