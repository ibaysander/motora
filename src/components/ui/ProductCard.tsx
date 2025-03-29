// @ts-ignore
import React from 'react';
import { ProductCard as FeatureProductCard } from '../../features/products';
import { Product } from '../../hooks/useApi';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
}

/**
 * ProductCard component for displaying a product in card format
 * This is a wrapper around the feature ProductCard component
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, isDarkMode }) => {
  // Ensure sales is a number for the feature component
  const productWithSales = {
    ...product,
    sales: product.sales || 0
  };
  
  return <FeatureProductCard 
    product={productWithSales} 
    onEdit={() => onEdit()} 
    onDelete={onDelete} 
    isDarkMode={isDarkMode} 
  />;
};

export default ProductCard; 