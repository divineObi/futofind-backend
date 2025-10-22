import { Response } from 'express';
import Item from '../models/item.model';
import Claim from '../models/claim.model';
import { type AuthRequest } from '../middleware/auth.middleware';

// Get all items reported BY the logged-in user
export const getMyReportedItems = async (req: AuthRequest, res: Response) => {
    const items = await Item.find({ reporter: req.user._id });
    res.json(items);
};

// Get all claims made BY the logged-in user
export const getMyClaims = async (req: AuthRequest, res: Response) => {
    const claims = await Claim.find({ claimant: req.user._id }).populate('item', 'title status');
    res.json(claims);
};