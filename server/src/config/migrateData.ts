import { initializeDatabase } from './initDb';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';

async function migrateData() {
  try {
    // Initialize database
    await initializeDatabase();

    // Get all unique categories and brands from existing products
    const products = await Product.findAll();
    const categories = new Set(products.map(p => p.namaProduk));
    const brands = new Set(products.map(p => p.merek));

    // Create categories
    const categoryMap = new Map();
    for (const categoryName of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: categoryName }
      });
      categoryMap.set(categoryName, category.id);
    }

    // Create brands
    const brandMap = new Map();
    for (const brandName of brands) {
      const [brand] = await Brand.findOrCreate({
        where: { name: brandName }
      });
      brandMap.set(brandName, brand.id);
    }

    // Update products with new foreign keys
    for (const product of products) {
      await product.update({
        categoryId: categoryMap.get(product.namaProduk),
        brandId: brandMap.get(product.merek)
      });
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
  }
}

// Run migration
migrateData(); 