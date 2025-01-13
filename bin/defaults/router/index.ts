// @deno-types="npm:@types/express"
import {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
    Router,
} from 'express';

const router = Router();

router.get(
    '/',
    function (req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        res.send('Router %%router_name%% is running');
    },
);

export default router;
