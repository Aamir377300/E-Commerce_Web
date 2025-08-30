// Updated addProduct.ts route with better error handling
import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import User from '../models/user';
import authMiddleware from '../middleware/verifyToken';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Route to get seller info for the logged-in user
router.get('/seller', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('GET /seller - User ID from token:', req.user?.id);
    
    const userId = req.user?.id;
    
    if (!userId) {
      console.error('User ID not found in request');
      return res.status(401).json({ 
        error: 'Unauthorized: User ID not found.',
        message: 'Authentication failed. Please login again.'
      });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        message: 'The user ID in the token is invalid.'
      });
    }

    console.log('Fetching user from database with ID:', userId);
    const seller = await User.findById(userId).select('-password');
    
    if (!seller) {
      console.error('Seller not found with ID:', userId);
      return res.status(404).json({ 
        error: 'Seller not found',
        message: 'User account not found. Please contact support.'
      });
    }

    console.log('Seller found:', seller.name, seller.email);
    res.json(seller);
  } catch (err: any) {
    console.error('Get seller info error:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Route to fetch products for a specific seller by ID
router.get('/:sellerId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('GET /:sellerId - Seller ID:', req.params.sellerId);
    console.log('GET /:sellerId - User ID from token:', req.user?.id);

    const { sellerId } = req.params;
    const userId = req.user?.id;

    if (!Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ 
        error: 'Invalid sellerId format',
        message: 'The provided seller ID is invalid.'
      });
    }

    // Optional: Verify that the authenticated user is requesting their own products
    if (userId !== sellerId) {
      console.warn('User attempting to access another seller\'s products:', {
        requestedSellerId: sellerId,
        authenticatedUserId: userId
      });
      // You might want to restrict this or allow it based on your business logic
    }

    console.log('Fetching products for seller:', sellerId);
    const products = await Product.find({ seller: sellerId });
    console.log('Found products count:', products.length);
    
    res.json(products);
  } catch (err: any) {
    console.error('Get products error:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch products. Please try again later.'
    });
  }
});

// Route to add a new product
router.post('/addProduct', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const io = req.app.get('io');
  const userId = req.user?.id;

  console.log('POST /addProduct - User ID:', userId);
  console.log('POST /addProduct - Request body:', req.body);

  if (!userId) {
    return res.status(401).json({ 
      error: 'Unauthorized: User ID not found.',
      message: 'Authentication failed. Please login again.'
    });
  }

  try {
    const { name, category, price, description, image, stock } = req.body;

    // Validate required fields
    if (!name || !category || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Product name, category, and valid price are required'
      });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Valid stock quantity is required'
      });
    }

    const seller = await User.findById(userId);
    if (!seller) {
      return res.status(404).json({ 
        error: 'Seller not found',
        message: 'User account not found. Please contact support.'
      });
    }

    const product = new Product({ 
      seller: userId, 
      name, 
      category, 
      price, 
      description: description || '', 
      image: image || '', 
      stock 
    });

    console.log('Creating product:', product);
    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct._id);

    // Emit socket event
    if (io) {
      io.emit('productAdded', savedProduct);
      console.log('Socket event emitted for new product');
    }

    res.status(201).json(savedProduct);
  } catch (err: any) {
    console.error('Error adding product:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((e: any) => e.message);
      return res.status(400).json({ 
        error: 'Validation error',
        message: validationErrors.join(', ')
      });
    }

    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to add product. Please try again later.'
    });
  }
});

export default router;