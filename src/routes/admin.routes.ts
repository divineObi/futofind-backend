import { Router, json } from 'express';
import { getPendingClaims, resolveClaim } from '../controllers/admin.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();


// Route to get all pending claims
router.route('/claims').get(protect, admin, getPendingClaims);

// Route to approve or reject a specific claim
router.route('/claims/:claimId').patch(protect, admin, resolveClaim);

export default router;