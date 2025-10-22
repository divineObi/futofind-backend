import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  reportType: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String, required: false },
  reporter: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, enum: ['found', 'pending', 'claimed'], default: 'found' },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
export default Item;