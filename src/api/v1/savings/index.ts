import { Router } from 'express';
import {
    createSavings,
    getAllSavings,
    getAllSavingsSummary,
    removeWalletPermanently,
    updateAmount,
} from './controller.ts';
import { auth } from '../../../middlewares/auth.ts';
const router = Router();

router.get('/', auth, getAllSavings);
router.get('/summary', auth, getAllSavingsSummary);
router.post('/', auth, createSavings);
router.patch('/amount', auth, updateAmount);
router.delete('/', auth, removeWalletPermanently);

export default router;
