import express from 'express';
import Product from '../models/Product'; // your Product model

const router = express.Router();

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required.' });

  try {
    const regex = new RegExp(q.toString(), 'i'); 
    const products = await Product.find({ $or: [{ name: regex }, { category: regex }] });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
