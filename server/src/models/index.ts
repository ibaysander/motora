import Product from './Product';
import Category from './Category';
import Brand from './Brand';
import Motorcycle from './Motorcycle';

// Set up associations
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });
Brand.hasMany(Product, { as: 'products', foreignKey: 'brandId' });

export {
  Product,
  Category,
  Brand,
  Motorcycle
}; 