import { Router } from 'express';
import Product from '../models/Product';

const router = Router();

// Create a new product
router.post('/parts', async (req, res) => {
  try {
    const { name, sku, category, currentStock, minThreshold } = req.body;
    const product = await Product.create({
      namaProduk: name,
      merek: category,
      currentStock,
      minThreshold
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update stock
router.patch('/parts/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { newStock } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({ currentStock: newStock });
    res.json(product);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get all products
router.get('/parts', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
