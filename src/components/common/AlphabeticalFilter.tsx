import type { FC, MouseEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AlphabeticalFilterProps {
  selected: string | null;
  onSelect: (letter: string | null) => void;
}

export const AlphabeticalFilter: FC<AlphabeticalFilterProps> = ({ selected, onSelect }) => {
  const { isDarkMode } = useTheme();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const handleClick = (letter: string | null) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSelect(letter);
  };
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        type="button"
        onClick={handleClick(null)}
        className={`px-3 py-1 rounded ${
          selected === null 
            ? 'bg-blue-600 text-white' 
            : isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {alphabet.map(letter => (
        <button
          key={letter}
          type="button"
          onClick={handleClick(letter)}
          className={`px-3 py-1 rounded ${
            selected === letter 
              ? 'bg-blue-600 text-white' 
              : isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}; 