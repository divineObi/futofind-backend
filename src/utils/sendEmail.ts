import sgMail from '@sendgrid/mail';

// Set the API key for the SendGrid mail client
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const msg = {
     to: to,
    from: {
        name: 'FutoFind Support', // This is the name the user will see
        email: process.env.VERIFIED_SENDER_EMAIL!, // This is your verified @gmail.com address
    },
    subject: subject,
    html: html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // We log the error but don't re-throw it, so an email failure 
    // doesn't cause the entire API request to fail.
  }
};

import { Response } from 'express';
import Claim from '../models/claim.model';
import Item from '../models/item.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/sendEmail'; // <-- IMPORT OUR NEW FUNCTION

// ... (keep the existing getPendingClaims function)

// UPDATE the resolveClaim function
export const resolveClaim = async (req: AuthRequest, res: Response) => {
  const { claimId } = req.params;
  const { decision } = req.body;

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ message: 'Invalid decision value' });
  }

  // --- No changes needed here, we need the claimant and item details ---
  const claim = await Claim.findById(claimId).populate('item').populate('claimant');
  if (!claim) { return res.status(404).json({ message: 'Claim not found' }); }
  const item = await Item.findById(claim.item);
  if (!item) { return res.status(404).json({ message: 'Associated item not found' }); }

  if (decision === 'approved') {
    claim.status = 'approved';
    item.status = 'claimed';
  } else {
    claim.status = 'rejected';
    item.status = 'found';
  }

  await claim.save();
  await item.save();

  // --- NEW: EMAIL NOTIFICATION LOGIC ---
  try {
    const claimant = claim.claimant as any; // Cast to access properties
    const claimedItem = claim.item as any; // Cast to access properties

    const subject = `Update on your FutoFind Claim for: ${claimedItem.title}`;
    let htmlContent = '';

    if (decision === 'approved') {
      htmlContent = `
        <h3>Hello, ${claimant.name}!</h3>
        <p>We have good news regarding your claim for the item: <strong>${claimedItem.title}</strong>.</p>
        <p>Your claim has been reviewed and <strong>approved!</strong></p>
        <p>You can now proceed to the campus security office or designated collection point to retrieve your item. Please bring your student/staff ID for verification.</p>
        <p>Thank you for using FutoFind.</p>
      `;
    } else { // 'rejected'
      htmlContent = `
         <h3>Hello, ${claimant.name}.</h3>
        <p>We have an update on your claim for the item: <strong>${claimedItem.title}</strong>.</p>
        <p>After careful review, your claim has been <strong>rejected</strong>. This is usually because the justification provided did not contain enough unique details to verify ownership.</p>
        <p>The item has now been made available for others to claim. We encourage you to keep searching the FutoFind platform.</p>
        <p>Thank you for your understanding.</p>
      `;
    }
    
    // Send the email!
    await sendEmail({
      to: claimant.email,
      subject: subject,
      html: htmlContent,
    });

  } catch (emailError) {
      console.error("Failed to send notification email after resolving claim:", emailError);
  }
  // --- END OF EMAIL NOTIFICATION LOGIC ---

  res.json({ message: `Claim has been ${decision}` });
};