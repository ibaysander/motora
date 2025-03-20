import Category from './Category';
import Brand from './Brand';
import Product from './Product';

// Set up associations
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Product.belongsTo(Brand, { as: 'brand', foreignKey: 'brandId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });
Brand.hasMany(Product, { as: 'products', foreignKey: 'brandId' });

export { Category, Brand, Product }; 