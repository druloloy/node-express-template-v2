import { Router } from 'express';
import { createResponse } from '../../../utils/response.ts';
import { db } from '../../../database/index.ts';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const data = await db.selectFrom('prosper.budget_metadata').selectAll()
        .execute();

    return createResponse(res, {
        data,
        message: 'Fetched Succesfully',
        status: 200,
    });
});

export default router;
