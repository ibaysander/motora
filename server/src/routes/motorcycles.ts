import { Router } from 'express';
import { Motorcycle } from '../models';

const router = Router();

// Get all motorcycles
router.get('/motorcycles', async (req, res) => {
  try {
    const motorcycles = await Motorcycle.findAll({
      order: [
        ['manufacturer', 'ASC'],
        ['model', 'ASC']
      ]
    });
    res.json(motorcycles);
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
    res.status(500).json({ error: 'Failed to fetch motorcycles' });
  }
});

// Get a single motorcycle
router.get('/motorcycles/:id', async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }
    res.json(motorcycle);
  } catch (error) {
    console.error('Error fetching motorcycle:', error);
    res.status(500).json({ error: 'Failed to fetch motorcycle' });
  }
});

// Create a new motorcycle
router.post('/motorcycles', async (req, res) => {
  try {
    const motorcycle = await Motorcycle.create(req.body);
    res.status(201).json(motorcycle);
  } catch (error) {
    console.error('Error creating motorcycle:', error);
    res.status(400).json({ error: 'Failed to create motorcycle' });
  }
});

// Update a motorcycle
router.put('/motorcycles/:id', async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }
    await motorcycle.update(req.body);
    res.json(motorcycle);
  } catch (error) {
    console.error('Error updating motorcycle:', error);
    res.status(400).json({ error: 'Failed to update motorcycle' });
  }
});

// Delete a motorcycle
router.delete('/motorcycles/:id', async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findByPk(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }
    await motorcycle.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting motorcycle:', error);
    res.status(500).json({ error: 'Failed to delete motorcycle' });
  }
});

export default router; 