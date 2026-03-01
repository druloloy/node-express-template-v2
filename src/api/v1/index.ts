// @deno-types="npm:@types/express@5.0.0"
import { Router } from 'express';
import type {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';

const router = Router();

router.get(
    '/',
    function (
        _req: ExpressRequest,
        res: ExpressResponse,
        _next: NextFunction,
    ) {
        res.json({ status: 'ok', version: 'v1' });
    },
);

export default router;
