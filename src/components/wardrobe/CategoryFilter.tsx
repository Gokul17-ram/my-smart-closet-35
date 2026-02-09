import { motion } from 'framer-motion';
import { Category } from '@/types/wardrobe';
import { cn } from '@/lib/utils';
import { Shirt, CircleDot, Footprints, Sparkles, Glasses } from 'lucide-react';

interface CategoryFilterProps {
  selected: Category | 'all';
  onChange: (category: Category | 'all') => void;
}

const categories: { value: Category | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Items', icon: Sparkles },
  { value: 'tops', label: 'Tops', icon: Shirt },
  { value: 'bottoms', label: 'Bottoms', icon: CircleDot },
  { value: 'dresses', label: 'Dresses', icon: Shirt },
  { value: 'outerwear', label: 'Outerwear', icon: Shirt },
  { value: 'footwear', label: 'Footwear', icon: Footprints },
  { value: 'accessories', label: 'Accessories', icon: Glasses },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selected === category.value;
        return (
          <motion.button
            key={category.value}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            onClick={() => onChange(category.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </motion.button>
        );
      })}
    </div>
  );
}
