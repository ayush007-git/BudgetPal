import { Router } from 'express';
import { createExpense, getGroupExpenses } from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// GET / - get all expenses for a group
router.get('/', authenticateToken, getGroupExpenses);

// POST / - create a new expense within a group
router.post('/', authenticateToken, createExpense);

export default router;


