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
    function (req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        res.send('Hello World!');
    },
);

export default router;
