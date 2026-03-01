import type {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';
import { type User as SupabaseUser } from '@supabase/supabase-js';

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

export type User = SupabaseUser;

type Controller = (
    req: ExpressRequest & { user?: User },
    res: ExpressResponse,
    next: NextFunction,
) => void;
