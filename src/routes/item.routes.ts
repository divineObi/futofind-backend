// import { Router } from 'express';
// import { reportItem, getFoundItems, claimItem, getItemById } from '../controllers/item.controller'; 
// import { protect } from '../middleware/auth.middleware';
// import upload from '../config/cloudinary';
// const router = Router();
// // All item routes are protected, users must be logged in.
// router.route('/')
//   .post(protect, reportItem)
//   .get(protect, getFoundItems);
// // This creates a POST endpoint like /api/items/some_item_id/claim
// router.route('/:itemId/claim').post(protect, claimItem);
// // This route now handles getting a single item
// router.route('/:itemId').get(protect, getItemById);
// // This route remains for claiming the item
// router.route('/:itemId/claim').post(protect, claimItem);
// // Change the main POST route to use the middleware
// // upload.single('image') tells multer to expect one file named 'image'
// router.route('/').post(protect, upload.single('image'), reportItem).get(protect, getFoundItems);
// // UPDATE THIS LINE to include the middleware for file uploads.
// // It will now expect a single file with the field name 'proofImage'.
// router.route('/:itemId/claim').post(protect, upload.single('proofImage'), claimItem);

// export default router;

import { Router } from 'express';
import { reportItem, getFoundItems, getItemById, claimItem } from '../controllers/item.controller'; 
import { protect } from '../middleware/auth.middleware';
import upload from '../config/cloudinary';

const router = Router();

// --- START: DEBUGGING MIDDLEWARE ---
// This tiny function will run on our route and log exactly what's in the body and file.
const debugMiddleware = (req: any, res: any, next: any) => {
    console.log('--- DEBUGGER: INSIDE ITEM ROUTE ---');
    console.log('REQUEST BODY:', req.body);
    console.log('REQUEST FILE:', req.file);
    console.log('---------------------------------');
    next(); // This is crucial, it tells Express to continue to the next function (our controller)
};
// --- END: DEBUGGING MIDDLEWARE ---


// We are inserting 'debugMiddleware' right into the chain.
router.route('/').post(protect, upload.single('image'), debugMiddleware, reportItem).get(protect, getFoundItems);


// The rest of the routes remain the same
router.route('/:itemId').get(protect, getItemById);
router.route('/:itemId/claim').post(protect, upload.single('proofImage'), claimItem);

export default router;