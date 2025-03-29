// @ts-ignore
import React from 'react';
import { ProductList as FeatureProductList } from '../../features/products';
import { SortConfig } from '../../features/products';
import { Product } from '../../hooks/useApi';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

/**
 * ProductList component for displaying products in a table format
 * This is a wrapper around the feature ProductList component
 */
const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isDarkMode, sortConfig, onSort }) => {
  // Ensure all products have a sales property that's a number
  const productsWithSales = products.map(product => ({
    ...product,
    sales: product.sales || 0
  }));

  return <FeatureProductList 
    products={productsWithSales} 
    onEdit={onEdit} 
    onDelete={onDelete} 
    isDarkMode={isDarkMode} 
    sortConfig={sortConfig} 
    onSort={onSort}
  />;
};

export default ProductList; 