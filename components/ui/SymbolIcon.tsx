
import React from 'react';
import { Star, Sun, Flower, Anchor } from 'lucide-react';

interface SymbolIconProps {
  name: string;
  className?: string;
}

const SymbolIcon: React.FC<SymbolIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case 'Star':
      return <Star className={className} />;
    case 'Lantern':
      return <Sun className={className} />; // Using Sun for Lantern
    case 'Flower':
      return <Flower className={className} />;
    default:
      return <Anchor className={className} />; // Default icon
  }
};

export default SymbolIcon;
