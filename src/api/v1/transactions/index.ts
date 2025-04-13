import { Router } from 'express';
import { getTransactionsSummary } from './controller.ts';
import { auth } from '../../../middlewares/auth.ts';
const router = Router();

router.get('/', auth, getTransactionsSummary);

export default router;
