import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Item' },
  claimant: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  justification: { type: String, required: true },
  proofImageUrl: { type: String, required: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;