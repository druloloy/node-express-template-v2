import { Router } from 'express';
import {
    createSavings,
    getAllSavings,
    getAllSavingsSummary,
    removeWalletPermanently,
    updateAmount,
} from './controller.ts';
const router = Router();

router.get('/', getAllSavings);
router.get('/summary', getAllSavingsSummary);
router.post('/', createSavings);
router.patch('/amount', updateAmount);
router.delete('/', removeWalletPermanently);

export default router;
