import { Router } from 'express';
import { createGroup, addMemberToGroup, getGroupDetails, calculateGroupBalance } from '../controllers/groupController.js';
import expenseRoutes from './expenseRoutes.js';

const router = Router();

// POST / - create a new group
router.post('/', createGroup);

// POST /:groupId/members - add a user to a group
router.post('/:groupId/members', addMemberToGroup);

// GET /:groupId - get details of a specific group
router.get('/:groupId', getGroupDetails);

// GET /:groupId/balance - get the simplified settlement plan
router.get('/:groupId/balance', calculateGroupBalance);

// Mount expense routes under a group
router.use('/:groupId/expenses', expenseRoutes);

export default router;


