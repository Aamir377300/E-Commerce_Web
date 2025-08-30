import express, { Request, Response } from 'express';
import Product from '../models/Product';

const router = express.Router();

// Get all products (optionally filter by category)
router.get('/category', async (req, res) => {
    const category = req.query.category as string | undefined;
    let products;
  
    if (category && category !== 'all') {
      products = await Product.find({ category: new RegExp(`^${category}$`, 'i') });
    } else {
      products = await Product.find();
    }
  
    res.json(products);
  });

  
  export default router