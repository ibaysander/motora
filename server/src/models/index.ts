import Product from './Product';
import Category from './Category';
import Brand from './Brand';
import Motorcycle from './Motorcycle';
import ProductMotorcycleCompatibility from './ProductMotorcycleCompatibility';
import { Model } from 'sequelize';

// Cast models to any to allow Sequelize methods to be called
// These are dynamically added by Sequelize at runtime
(Product as any).belongsTo(Category as any, { as: 'category', foreignKey: 'categoryId' });
(Product as any).belongsTo(Brand as any, { as: 'brand', foreignKey: 'brandId' });
(Product as any).belongsTo(Motorcycle as any, { as: 'motorcycle', foreignKey: 'motorcycleId' });
(Category as any).hasMany(Product as any, { as: 'products', foreignKey: 'categoryId' });
(Brand as any).hasMany(Product as any, { as: 'products', foreignKey: 'brandId' });
(Motorcycle as any).hasMany(Product as any, { as: 'products', foreignKey: 'motorcycleId' });

// Set up many-to-many relationship between Product and Motorcycle
(Product as any).belongsToMany(Motorcycle as any, { 
  through: ProductMotorcycleCompatibility,
  as: 'compatibleMotorcycles',
  foreignKey: 'productId',
  otherKey: 'motorcycleId'
});

(Motorcycle as any).belongsToMany(Product as any, { 
  through: ProductMotorcycleCompatibility,
  as: 'compatibleProducts',
  foreignKey: 'motorcycleId',
  otherKey: 'productId'
});

export {
  Product,
  Category,
  Brand,
  Motorcycle,
  ProductMotorcycleCompatibility
}; 