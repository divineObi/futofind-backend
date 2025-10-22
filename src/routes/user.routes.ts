import { Router } from 'express';
import { getMyReportedItems, getMyClaims } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-items', protect, getMyReportedItems);
router.get('/my-claims', protect, getMyClaims);

export default router;