import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';

const router = express.Router();

interface Signup extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'customer' | 'seller' | 'deliveryboy';
  };
}

router.post('/signup', async (req: Signup, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ error: 'All fields are required including role' });
  }

  const validRoles = ['customer', 'seller', 'deliveryboy'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be customer, seller, or deliveryboy' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
