import { Router } from 'express';
import {
    createBudget,
    getAllBudgets,
    getBudgetsSummary,
    removeBudgetPermanently,
    updateBudget,
    validateBudget,
} from './controller.ts';

const router = Router();

router.get('/', getAllBudgets);
router.get('/summary', getBudgetsSummary);
router.post('/', createBudget);
router.patch('/validate', validateBudget);
router.patch('/', updateBudget);
router.delete('/', removeBudgetPermanently);

export default router;
