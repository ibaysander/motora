import { Router } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';

const router = Router();

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Brand }
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Brand }
      ]
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const productWithAssociations = await Product.findByPk(product.id, {
      include: [
        { model: Category },
        { model: Brand }
      ]
    });
    res.status(201).json(productWithAssociations);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Brand }
      ]
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Clear all data
router.post('/products/clear-all', async (req, res) => {
  try {
    // Delete all products first (due to foreign key constraints)
    await Product.destroy({ where: {} });
    
    // Delete all categories and brands
    await Category.destroy({ where: {} });
    await Brand.destroy({ where: {} });

    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router; 