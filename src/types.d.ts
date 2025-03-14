// @deno-types="npm:@types/express"
import type {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';

type ResponseData =
    | {
        [key: string]: unknown;
    }
    | unknown[]
    | boolean
    | number
    | null;

type ResponseContent = {
    status: number;
    message: string;
    data?: ResponseData;
};

type Controller = (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction,
) => void;
