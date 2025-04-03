import Product from './Product';
import Category from './Category';
import Brand from './Brand';
import Motorcycle from './Motorcycle';
import ProductMotorcycleCompatibility from './ProductMotorcycleCompatibility';
import Transaction from './Transaction';
import TransactionItem from './TransactionItem';
import { Model } from 'sequelize';

// Cast models to any to allow Sequelize methods to be called
// These are dynamically added by Sequelize at runtime
(Product as any).belongsTo(Category as any, { as: 'category', foreignKey: 'categoryId' });
(Product as any).belongsTo(Brand as any, { as: 'brand', foreignKey: 'brandId' });
(Product as any).belongsTo(Motorcycle as any, { as: 'motorcycle', foreignKey: 'motorcycleId' });
(Category as any).hasMany(Product as any, { as: 'products', foreignKey: 'categoryId' });
(Brand as any).hasMany(Product as any, { as: 'products', foreignKey: 'brandId' });
(Motorcycle as any).hasMany(Product as any, { as: 'products', foreignKey: 'motorcycleId' });

// Transaction associations
(Transaction as any).hasMany(TransactionItem as any, { as: 'items', foreignKey: 'transactionId' });
(TransactionItem as any).belongsTo(Transaction as any, { foreignKey: 'transactionId' });
(TransactionItem as any).belongsTo(Product as any, { as: 'product', foreignKey: 'productId' });

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
  ProductMotorcycleCompatibility,
  Transaction,
  TransactionItem
}; 