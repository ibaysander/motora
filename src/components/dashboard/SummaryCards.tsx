import type { FC } from 'react';
import { StatCard } from './StatCard';
import type { Product } from '../../types';

interface SummaryCardsProps {
  products: Product[];
}

export const SummaryCards: FC<SummaryCardsProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum: number, product: Product) => sum + product.currentStock, 0);
  const lowStockItems = products.filter((p: Product) => p.currentStock <= p.minThreshold).length;
  const totalHargaBeli = products.reduce((sum: number, product: Product) => sum + (product.hargaBeli || 0), 0);
  const totalHargaJual = products.reduce((sum: number, product: Product) => sum + (product.hargaJual || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <StatCard 
        title="Total Products" 
        value={`${totalProducts} Products`} 
      />
      <StatCard 
        title="Total Stock" 
        value={`${totalStock} Items`}
        type="info"
      />
      <StatCard 
        title="Low Stock Items" 
        value={`${lowStockItems} Products`}
        type="warning" 
      />
      <StatCard 
        title="Total Harga Beli" 
        value={`Rp ${totalHargaBeli.toLocaleString()}`}
        type="info"
      />
      <StatCard 
        title="Total Harga Jual" 
        value={`Rp ${totalHargaJual.toLocaleString()}`}
        type="success"
      />
    </div>
  );
}; 