import { Router } from 'express';
import { createGroup, addMemberToGroup, getGroupDetails, calculateGroupBalance, getUserGroups, markDebtAsPaid } from '../controllers/groupController.js';
import { authenticateToken } from '../middleware/auth.js';
import expenseRoutes from './expenseRoutes.js';

const router = Router();

// GET / - get all groups for the authenticated user
router.get('/', authenticateToken, getUserGroups);

// POST / - create a new group (requires authentication)
router.post('/', authenticateToken, createGroup);

// POST /:groupId/members - add a user to a group (requires authentication)
router.post('/:groupId/members', authenticateToken, addMemberToGroup);

// GET /:groupId - get details of a specific group (requires authentication)
router.get('/:groupId', authenticateToken, getGroupDetails);

// GET /:groupId/balance - get the simplified settlement plan (requires authentication)
router.get('/:groupId/balance', authenticateToken, calculateGroupBalance);

// POST /:groupId/mark-paid - mark a debt as paid (requires authentication)
router.post('/:groupId/mark-paid', authenticateToken, markDebtAsPaid);

// Mount expense routes under a group
router.use('/:groupId/expenses', expenseRoutes);

export default router;


