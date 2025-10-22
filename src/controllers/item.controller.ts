import { Response } from 'express';
import Item from '../models/item.model';
import Claim from '../models/claim.model';
import Notification from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/sendEmail';

// --- NEW NOTIFICATIONS ADDED ---
export const reportItem = async (req: AuthRequest, res: Response) => {
  const { reportType, title, description, category, location, date } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  const user = req.user!;

  const item = new Item({
    reportType, title, description, category, location, date,
    imageUrl: imageUrl, reporter: user._id,
  });

  const createdItem = await item.save();

  // --- Send Confirmation Notifications ---
  try {
    const reportTypeText = reportType === 'found' ? 'found item' : 'lost item';
    const message = `You successfully created a report for the ${reportTypeText}: "${title}".`;
    const subject = `FutoFind Report Confirmation: ${title}`;
    const emailHtml = `<h3>Hello, ${user.name}!</h3><p>This is a confirmation that your report for the ${reportTypeText} "<strong>${title}</strong>" has been successfully submitted to the FutoFind system.</p><p>You will be notified of any updates. You can view the status of your reports on your "My Activity" page.</p><p>Thank you!</p>`;

    await Notification.create({ user: user._id, message, link: '/my-reports' });
    if (user.email) {
      await sendEmail({ to: user.email, subject, html: emailHtml });
    }
  } catch(e) { console.error("Failed to send report confirmation notifications:", e); }

  res.status(201).json(createdItem);
};


// --- NEW NOTIFICATIONS ADDED ---
export const claimItem = async (req: AuthRequest, res: Response) => {
  const { justification } = req.body;
  const { itemId } = req.params;
  const proofImageUrl = req.file ? req.file.path : null;
  const user = req.user!;

  const item = await Item.findById(itemId);
  if (!item) { return res.status(404).json({ message: 'Item not found' }); }
  if (item.reporter.toString() === user._id.toString()) { return res.status(400).json({ message: "You cannot claim an item you reported." }); }
  if (item.status !== 'found') { return res.status(400).json({ message: 'Item is not available for claiming' }); }

  const claim = new Claim({
    item: itemId, claimant: user._id, justification, proofImageUrl: proofImageUrl,
  });

  const createdClaim = await claim.save();
  item.status = 'pending';
  await item.save();

  // --- Send Confirmation Notifications ---
  try {
    const message = `Your claim for "${item.title}" has been submitted and is pending review.`;
    const subject = `FutoFind Claim Submitted: ${item.title}`;
    const emailHtml = `<h3>Hello, ${user.name}!</h3><p>This is a confirmation that your claim for the item "<strong>${item.title}</strong>" has been successfully submitted.</p><p>It is now pending review by an administrator. You will be notified via email and in the app once a decision has been made.</p><p>Thank you for your patience.</p>`;

    await Notification.create({ user: user._id, message, link: '/my-reports' });
    if (user.email) {
      await sendEmail({ to: user.email, subject, html: emailHtml });
    }
  } catch(e) { console.error("Failed to send claim submission notifications:", e); }

  res.status(201).json({ message: 'Claim submitted successfully', claim: createdClaim });
};

// --- These functions remain unchanged ---
export const getFoundItems = async (req: AuthRequest, res: Response) => {
  const { keyword, category, location, date } = req.query;
  let filter: any = { reportType: 'found', status: 'found' };
  if (keyword) { const regex = new RegExp(keyword as string, 'i'); filter.$or = [{ title: regex }, { description: regex }]; }
  if (category && category !== 'All') { filter.category = category; }
  if (location) { filter.location = new RegExp(location as string, 'i'); }
  if (date) { filter.date = { $gte: new Date(date as string) }; }
  const items = await Item.find(filter).populate('reporter', 'name email');
  res.json(items);
};

export const getItemById = async (req: AuthRequest, res: Response) => {
  const item = await Item.findById(req.params.itemId).populate('reporter', 'name email');
  if (item) { res.json(item); } else { res.status(404).json({ message: 'Item not found' }); }
};
