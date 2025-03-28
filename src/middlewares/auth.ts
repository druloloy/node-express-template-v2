import { Controller } from '../types.d.ts';
import ApiError from '../utils/ApiError.ts';
import { createSupabaseClient } from '../utils/supabase.ts';
import { db } from '../database/index.ts';

export const auth: Controller = async (req, res, next) => {
    const authorization = req.headers['authorization'] as string;

    if (!authorization) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    const token = authorization.split(' ')[1];

    if (!token) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    const result = await db
        .selectFrom('prosper.profiles')
        .where('auth_id', '=', user.id)
        .select('id')
        .executeTakeFirst();

    if (!result?.id) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    user.profile_id = result.id;
    req.user = user;

    return next();
};
