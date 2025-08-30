import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/verifyToken';
import Cart from '../models/Cart';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

router.post('/addtocart', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'ProductId is required' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      // Increase quantity by 1
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// GET user's cart
router.get('/cart', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const cart = await Cart.findOne({ user: userId }).populate('items.product'); // populate product details if needed
  
      if (!cart) {
        return res.status(200).json({ items: [] }); // empty cart if none found
      }
  
      res.json(cart);
    } catch (err) {
      console.error('Get cart error:', err);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  });

  router.post('/removeItem', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { productId } = req.body;
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!productId) {
        return res.status(400).json({ error: 'ProductId is required' });
      }
  
      // Use updateOne with $pull to remove the item from the items array by product id
      const result = await Cart.updateOne(
        { user: userId },
        { $pull: { items: { product: productId } } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Product not found in cart' });
      }
  
      // Optionally return updated cart
      const updatedCart = await Cart.findOne({ user: userId }).populate('items.product');
  
      res.json(updatedCart);
    } catch (err) {
      console.error('Remove item error:', err);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  });

  router.post('/updateQuantity', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { productId, quantity } = req.body;
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!productId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'Invalid productId or quantity' });
      }
  
      const cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
  
      const item = cart.items.find(item => item.product.toString() === productId);
  
      if (!item) {
        return res.status(404).json({ error: 'Product not found in cart' });
      }
  
      item.quantity = quantity;
  
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error('Update quantity error:', err);
      res.status(500).json({ error: 'Failed to update quantity' });
    }
  });
  

export default router;
