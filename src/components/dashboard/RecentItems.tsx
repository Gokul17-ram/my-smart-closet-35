import { motion } from 'framer-motion';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecentItems() {
  const { items } = useWardrobe();
  const recentItems = items.slice(0, 4);

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Recent Additions
        </h2>
        <Link
          to="/wardrobe"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-sm font-medium text-primary-foreground truncate">
                  {item.name}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
