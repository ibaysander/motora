import { Router } from 'express';
import { Request, Response } from 'express';
import { Product, Motorcycle, ProductMotorcycleCompatibility, Category, Brand } from '../models';

const router = Router();

// Get all compatible motorcycles for a product
router.get('/products/:productId/compatible-motorcycles', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const product = await (Product as any).findByPk(productId, {
      include: [{
        model: Motorcycle,
        as: 'compatibleMotorcycles'
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product.compatibleMotorcycles);
  } catch (error) {
    console.error('Error fetching compatible motorcycles:', error);
    res.status(500).json({ error: 'Failed to fetch compatible motorcycles' });
  }
});

// Get all compatible products for a motorcycle
router.get('/motorcycles/:motorcycleId/compatible-products', async (req: Request, res: Response) => {
  try {
    const { motorcycleId } = req.params;
    
    const motorcycle = await (Motorcycle as any).findByPk(motorcycleId, {
      include: [{
        model: Product as any,
        as: 'compatibleProducts',
        include: [
          { model: Category as any, as: 'category' },
          { model: Brand as any, as: 'brand' }
        ]
      }]
    });

    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }

    res.json(motorcycle.compatibleProducts);
  } catch (error) {
    console.error('Error fetching compatible products:', error);
    res.status(500).json({ error: 'Failed to fetch compatible products' });
  }
});

// Add compatibility between product and motorcycle
router.post('/products/:productId/motorcycles/:motorcycleId', async (req: Request, res: Response) => {
  try {
    const { productId, motorcycleId } = req.params;
    
    // Check if product exists
    const product = await (Product as any).findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if motorcycle exists
    const motorcycle = await (Motorcycle as any).findByPk(motorcycleId);
    if (!motorcycle) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }
    
    // Check if compatibility already exists
    const existingCompatibility = await (ProductMotorcycleCompatibility as any).findOne({
      where: { productId, motorcycleId }
    });
    
    if (existingCompatibility) {
      return res.status(409).json({ error: 'Compatibility already exists' });
    }
    
    // Create the compatibility
    await (ProductMotorcycleCompatibility as any).create({ productId, motorcycleId });
    
    res.status(201).json({ message: 'Compatibility added successfully' });
  } catch (error) {
    console.error('Error adding compatibility:', error);
    res.status(500).json({ error: 'Failed to add compatibility' });
  }
});

// Add multiple motorcycle compatibilities for a product
router.post('/products/:productId/motorcycles', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { motorcycleIds } = req.body;
    
    if (!motorcycleIds || !Array.isArray(motorcycleIds) || motorcycleIds.length === 0) {
      return res.status(400).json({ error: 'Invalid motorcycleIds array' });
    }
    
    // Check if product exists
    const product = await (Product as any).findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get existing compatibilities
    const existingCompatibilities = await (ProductMotorcycleCompatibility as any).findAll({
      where: { productId }
    });
    
    const existingMotorcycleIds = existingCompatibilities.map((c: any) => c.motorcycleId);
    
    // Filter out motorcycles that are already compatible
    const newMotorcycleIds = motorcycleIds.filter(
      (id: number) => !existingMotorcycleIds.includes(id)
    );
    
    // Create new compatibilities
    if (newMotorcycleIds.length > 0) {
      const newCompatibilities = newMotorcycleIds.map((motorcycleId: number) => ({
        productId,
        motorcycleId
      }));
      
      await (ProductMotorcycleCompatibility as any).bulkCreate(newCompatibilities);
    }
    
    res.status(201).json({ 
      message: 'Compatibilities added successfully',
      added: newMotorcycleIds.length,
      alreadyExisting: motorcycleIds.length - newMotorcycleIds.length
    });
  } catch (error) {
    console.error('Error adding compatibilities:', error);
    res.status(500).json({ error: 'Failed to add compatibilities' });
  }
});

// Remove compatibility between product and motorcycle
router.delete('/products/:productId/motorcycles/:motorcycleId', async (req: Request, res: Response) => {
  try {
    const { productId, motorcycleId } = req.params;
    
    const result = await (ProductMotorcycleCompatibility as any).destroy({
      where: { productId, motorcycleId }
    });
    
    if (result === 0) {
      return res.status(404).json({ error: 'Compatibility not found' });
    }
    
    res.json({ message: 'Compatibility removed successfully' });
  } catch (error) {
    console.error('Error removing compatibility:', error);
    res.status(500).json({ error: 'Failed to remove compatibility' });
  }
});

// Clear all compatibilities for a product
router.delete('/products/:productId/motorcycles', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const result = await (ProductMotorcycleCompatibility as any).destroy({
      where: { productId }
    });
    
    res.json({ 
      message: 'All compatibilities removed successfully',
      removed: result
    });
  } catch (error) {
    console.error('Error removing compatibilities:', error);
    res.status(500).json({ error: 'Failed to remove compatibilities' });
  }
});

// Get compatibility data for multiple products
router.get('/product-compatibilities', async (req: Request, res: Response) => {
  try {
    const { productIds } = req.query;
    
    if (!productIds) {
      return res.status(400).json({ error: 'productIds parameter is required' });
    }
    
    const productIdArray = String(productIds).split(',').map(id => parseInt(id, 10));
    
    if (!productIdArray.length || productIdArray.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid productIds parameter' });
    }
    
    // Use the same approach as the single product endpoint but for multiple products
    const compatibilityMap: {[key: number]: any[]} = {};
    
    // Initialize map with empty arrays for all requested products
    productIdArray.forEach(id => {
      compatibilityMap[id] = [];
    });
    
    // Get products with their compatible motorcycles
    const products = await (Product as any).findAll({
      where: {
        id: productIdArray
      },
      include: [{
        model: Motorcycle as any,
        as: 'compatibleMotorcycles'
      }]
    });
    
    // Populate the compatibility map
    for (const product of products) {
      if (product.compatibleMotorcycles && Array.isArray(product.compatibleMotorcycles)) {
        compatibilityMap[product.id] = product.compatibleMotorcycles;
      }
    }
    
    res.json(compatibilityMap);
  } catch (error) {
    console.error('Error fetching product compatibilities:', error);
    res.status(500).json({ error: 'Failed to fetch product compatibilities' });
  }
});

export default router; 