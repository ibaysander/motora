import { Router } from 'express';
import Brand from '../models/Brand';

const router = Router();

// Get all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Create a new brand
router.post('/brands', async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(400).json({ error: 'Failed to create brand' });
  }
});

// Update a brand
router.put('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    await brand.update(req.body);
    res.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(400).json({ error: 'Failed to update brand' });
  }
});

// Delete a brand
router.delete('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    await brand.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router; 