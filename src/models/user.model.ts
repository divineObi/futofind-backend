import mongoose, { Document, Model } from 'mongoose'; // <-- 1. Remove HookNextFunction
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'staff' | 'admin';
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' }
}, { timestamps: true });

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// This function now uses the interface
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Associate the interface with the model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;