import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
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
    // --- THIS IS THE BRUTE FORCE FIX ---
    // Convert the complex Mongoose document into a plain JavaScript object.
    const userObject = userDocument.toObject();

    // Now, we are accessing a property on a simple object, not a Mongoose proxy.
    res.status(201).json({
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
    // Convert the Mongoose document to a plain object before sending.
    const userObject = user.toObject();

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