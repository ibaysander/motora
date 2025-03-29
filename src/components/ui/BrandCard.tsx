// @ts-ignore
import React from 'react';
import { BrandCard as FeatureBrandCard } from '../../features/brands';
import { Brand } from '../../hooks/useApi';

interface BrandCardProps {
  brand: Brand;
  onEdit: () => void;
  onDelete: (id: number) => void;
  isDarkMode: boolean;
  productsCount: number;
}

/**
 * BrandCard component for displaying a brand in card format
 * This is a wrapper around the feature BrandCard component
 */
const BrandCard: React.FC<BrandCardProps> = ({ brand, onEdit, onDelete, isDarkMode, productsCount }) => {
  return <FeatureBrandCard 
    brand={brand} 
    onEdit={() => onEdit()} 
    onDelete={onDelete} 
    isDarkMode={isDarkMode} 
    productsCount={productsCount} 
  />;
};

export default BrandCard; 