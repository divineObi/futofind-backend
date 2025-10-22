import { Response } from 'express';
import Claim from '../models/claim.model';
import Item from '../models/item.model';
import Notification from '../models/notification.model'; // Ensure Notification is imported
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/sendEmail';

export const getPendingClaims = async (req: AuthRequest, res: Response) => {
    // This is now correct and includes imageUrl
    const claims = await Claim.find({ status: 'pending' })
      .populate('item', 'title description category imageUrl')
      .populate('claimant', 'name email');
    res.json(claims);
};

// --- THIS IS THE CORRECTED FUNCTION ---
export const resolveClaim = async (req: AuthRequest, res: Response) => {
  const { claimId } = req.params;
  const { decision } = req.body;

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ message: 'Invalid decision value' });
  }

  // Ensure we populate all necessary fields for notifications
  const claim = await Claim.findById(claimId).populate('item').populate('claimant');

  if (!claim) { return res.status(404).json({ message: 'Claim not found' }); }
  
  // Cast to specific types for TypeScript safety
  const claimant = claim.claimant as any;
  const claimedItem = claim.item as any;

  if (!claimant || !claimedItem) {
    return res.status(404).json({ message: 'Claim data is incomplete.' });
  }
  
  if (decision === 'approved') {
    claim.status = 'approved';
    claimedItem.status = 'claimed';
  } else {
    claim.status = 'rejected';
    claimedItem.status = 'found';
  }
  
  await claim.save();
  await claimedItem.save();

  // --- ROBUST NOTIFICATION LOGIC ---
  try {
    let notificationMessage = '';
    let emailHtml = '';
    const subject = `Update on your FutoFind Claim for: ${claimedItem.title}`;

    if (decision === 'approved') {
      notificationMessage = `Congratulations! Your claim for "${claimedItem.title}" has been approved.`;
      emailHtml = `<h3>Hello, ${claimant.name}!</h3><p>We have good news regarding your claim for the item: <strong>${claimedItem.title}</strong>.</p><p>Your claim has been reviewed and <strong>approved!</strong></p><p>You can now proceed to the campus security office or designated collection point to retrieve your item. Please bring your student/staff ID for verification.</p><p>Thank you for using FutoFind.</p>`;
    } else { // 'rejected'
      notificationMessage = `Unfortunately, your claim for "${claimedItem.title}" has been rejected.`;
      emailHtml = `<h3>Hello, ${claimant.name}.</h3><p>We have an update on your claim for the item: <strong>${claimedItem.title}</strong>.</p><p>After careful review, your claim has been <strong>rejected</strong>. This is usually because the justification provided did not contain enough unique details to verify ownership.</p><p>The item has now been made available for others to claim. We encourage you to keep searching the FutoFind platform.</p><p>Thank you for your understanding.</p>`;
    }

    // 1. Create In-App Notification
    await Notification.create({
        user: claimant._id,
        message: notificationMessage,
        link: `/my-reports`
    });

    // 2. Send Email Notification
    if (claimant.email) {
      console.log(`Attempting to send ${decision} email to: ${claimant.email}`);
      await sendEmail({ to: claimant.email, subject, html: emailHtml });
    }

  } catch (notificationError) {
      console.error("Failed to send notifications after resolving claim:", notificationError);
  }

  res.json({ message: `Claim has been ${decision}` });
};