// @deno-types="npm:@types/express@5.0.0"
import { Router } from 'express';
import type {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';

const router = Router();

/**
 * @openapi
 * /v1:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 version:
 *                   type: string
 *                   example: v1
 */
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
