import { motion } from 'framer-motion';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { ClothingItem } from '@/types/wardrobe';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ClothingCardProps {
  item: ClothingItem;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: ClothingItem) => void;
}

export function ClothingCard({ item, onEdit, onDelete, onView }: ClothingCardProps) {
  const statusColors = {
    clean: 'status-clean',
    worn: 'status-worn',
    'needs-wash': 'status-wash',
  };

  const statusLabels = {
    clean: 'Clean',
    worn: 'Worn',
    'needs-wash': 'Needs Wash',
  };

  return (
    <motion.div
      className="group glass-card overflow-hidden card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <motion.button
              className="flex-1 py-2 px-3 rounded-lg bg-card/90 backdrop-blur-sm text-sm font-medium flex items-center justify-center gap-2 hover:bg-card transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onView?.(item)}
            >
              <Eye className="w-4 h-4" />
              View
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-card/90 backdrop-blur-sm hover:bg-card transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit?.(item)}
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete?.(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={cn('text-xs font-medium', statusColors[item.laundryStatus])}>
            {statusLabels[item.laundryStatus]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground truncate">
          {item.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs capitalize">
            {item.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {item.color}
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>Worn {item.usageCount}x</span>
          <span className="capitalize">{item.season}</span>
        </div>
      </div>
    </motion.div>
  );
}
