import { Router } from 'express';
import {
    createBudget,
    getAllBudgets,
    getBudgetsSummary,
    removeBudgetPermanently,
    updateBudget,
    validateBudget,
} from './controller.ts';
import { auth } from '../../../middlewares/auth.ts';

const router = Router();

router.get('/', auth, getAllBudgets);
router.get('/summary', auth, getBudgetsSummary);
router.post('/', auth, createBudget);
router.patch('/validate', auth, validateBudget);
router.patch('/', auth, updateBudget);
router.delete('/', auth, removeBudgetPermanently);

export default router;
