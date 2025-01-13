import { db } from '../../../database/index.ts';
import { sql } from 'kysely';
import { generateRandomID } from '../../../utils/gen-id.ts';

export const defaultRouterService = async () => {
    const result = await Promise.resolve({
        status: 200,
        message: 'Default Router Service',
        data: {},
    });

    return result;
};
