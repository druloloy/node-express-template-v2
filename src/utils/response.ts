// @deno-types="npm:@types/express"
import type { Response as ExpressResponse } from 'express';
import { ResponseContent } from '../types.d.ts';

const createResponse = (res: ExpressResponse, content: ResponseContent) => {
    return res.status(content.status).json(content);
};

export { createResponse };
