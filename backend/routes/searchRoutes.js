import { Router } from 'express';
import { universalSearch } from '../controllers/searchController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST / - universal search endpoint
router.post('/', authenticateToken, universalSearch);

export default router;
