// @deno-types="npm:@types/express"
import { Router } from 'express';
import { z } from 'zod';
import { defaultRouterController } from './controllers.ts';
import validate from '../../../middlewares/validate.ts';

const router = Router();

const createSchema = z.object({
    name: z.string().min(1),
});

/**
 * @openapi
 * %%router_path%%:
 *   get:
 *     tags: [%%router_name%%]
 *     summary: Get all %%router_name%%
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [%%router_name%%]
 *     summary: Create %%router_name%%
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', defaultRouterController);
router.post('/', validate({ body: createSchema }), defaultRouterController);

export default router;
