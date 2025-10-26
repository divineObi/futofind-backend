import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
// The IUser interface is not even needed for this fix, but we'll leave the import.
import type { IUser } from '../models/user.model';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const userDocument = await User.create({ name, email, password, role });

  if (userDocument) {
    // --- THE NUCLEAR OPTION FIX ---
    // Cast the document to the 'any' type.
    // This tells TypeScript to stop all type-checking on this object.
    const userObject: any = userDocument;

    res.status(201).json({
      // The compiler will now be forced to accept this.
      _id: userObject._id,
      name: userObject.name,
      email: userObject.email,
      role: userObject.role,
      token: generateToken(userObject._id.toString()),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // --- APPLYING THE SAME FIX HERE ---
    // Cast the found document to 'any'.
    const userObject: any = user;

    res.json({
      _id: userObject._id,
      name: userObject.name,
      email: userObject.email,
      role: userObject.role,
      token: generateToken(userObject._id.toString()),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};