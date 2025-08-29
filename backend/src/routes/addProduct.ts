import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import User from '../models/user';
import authMiddleware from '../middleware/verifyToken';

const router = express.Router();

// A generic interface to extend the Request object with user data from middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // Assuming your JWT payload has an 'id' field
  };
}

router.post('/addProduct', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const io = req.app.get('io');
  const userId = req.user?.id; // Access user ID from the authenticated request

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
  }

  try {
    const { name, category, price, description, image, stock } = req.body;

    // Optional: Check if the user is a seller before allowing them to add a product
    const seller = await User.findById(userId);
    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({ error: 'Forbidden: Only sellers can add products.' });
    }

    if (!name || !category || typeof price !== 'number') {
      return res.status(400).json({ error: 'Product name, category, and price are required' });
    }
    
    // Use the authenticated user's ID as the sellerId
    const product = new Product({ seller: userId, name, category, price, description, image, stock });
    const savedProduct = await product.save();

    io.emit('productAdded', savedProduct);

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    if (!Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid sellerId' });
    }
    const products = await Product.find({ seller: sellerId });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/seller', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const seller = await User.findById(userId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ error: 'Seller not found or user is not a seller' });
    }

    res.json(seller);
  } catch (err) {
    console.error('Get seller info error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;