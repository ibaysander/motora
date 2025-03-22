import type { FC, ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: ReactNode;
  type?: 'default' | 'success' | 'warning' | 'info';
}

export const StatCard: FC<StatCardProps> = ({ title, value, type = 'default' }) => {
  const { isDarkMode } = useTheme();

  const getValueColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return '';
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`text-3xl ${getValueColor()}`}>{value}</p>
    </div>
  );
}; 