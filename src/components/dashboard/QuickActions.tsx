import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Sparkles, WashingMachine } from 'lucide-react';

const actions = [
  {
    icon: Plus,
    label: 'Add Item',
    description: 'Add a new clothing item',
    path: '/add-item',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Calendar,
    label: 'Plan Week',
    description: 'Plan your outfits for the week',
    path: '/planner',
    color: 'bg-sage/20 text-secondary-foreground',
  },
  {
    icon: Sparkles,
    label: 'Get Styled',
    description: 'AI outfit recommendations',
    path: '/recommendations',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: WashingMachine,
    label: 'Laundry',
    description: 'Track your laundry status',
    path: '/laundry',
    color: 'bg-muted text-muted-foreground',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link key={action.path} to={action.path}>
          <motion.div
            className="glass-card p-5 card-hover text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground">{action.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
