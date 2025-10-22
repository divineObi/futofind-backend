import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

// Import routes
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes'; 


const app = express();
const PORT = process.env.PORT || 5000;

// --- GLOBAL MIDDLEWARES (The Correct Way) ---
// 1. CORS for cross-origin requests
app.use(cors());

// 2. Body parsers
// This one is for JSON request bodies (e.g., login, register)
app.use(express.json()); 
// This one is for URL-encoded form data (we don't use it much, but it's good practice)
app.use(express.urlencoded({ extended: true }));

// NOTE: We do NOT need a global multipart parser. Multer handles that specifically
// on the routes that need it. These parsers are designed to ignore content-types they
// don't understand, so there should be no conflict.

// --- API ROUTES ---
// The routers should come AFTER the global middlewares.
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('FutoFind API is running...');
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));