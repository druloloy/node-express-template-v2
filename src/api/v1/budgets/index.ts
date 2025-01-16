import { Router } from 'express';
import { getAllBudgets, getBudgetsSummary } from './controller.ts';

const router = Router();


router.get('/', getAllBudgets);
router.get('/summary', getBudgetsSummary);
// router.post('/', createSavings);
// router.patch('/amount', updateAmount);
// router.delete('/', removeWalletPermanently);

export default router;
