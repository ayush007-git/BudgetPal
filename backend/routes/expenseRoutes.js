import { Router } from 'express';
import { createExpense } from '../controllers/expenseController.js';

const router = Router({ mergeParams: true });

// POST / - create a new expense within a group
router.post('/', createExpense);

export default router;


