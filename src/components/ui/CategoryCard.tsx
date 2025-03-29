// @ts-ignore
import React from 'react';
import { CategoryCard as FeatureCategoryCard } from '../../features/categories';
import { Category } from '../../hooks/useApi';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  productsCount: number;
}

/**
 * CategoryCard component for displaying a category in card format
 * This is a wrapper around the feature CategoryCard component
 */
const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete, isDarkMode, productsCount }) => {
  return <FeatureCategoryCard 
    category={category} 
    onEdit={() => onEdit()} 
    onDelete={onDelete} 
    isDarkMode={isDarkMode} 
    productsCount={productsCount} 
  />;
};

export default CategoryCard; 