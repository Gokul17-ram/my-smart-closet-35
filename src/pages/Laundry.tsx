import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { LaundryStatus } from '@/types/wardrobe';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WashingMachine, Shirt, AlertTriangle, CheckCircle } from 'lucide-react';

const statusConfig = {
  clean: {
    label: 'Clean',
    icon: CheckCircle,
    color: 'status-clean',
    bg: 'bg-secondary/20',
  },
  worn: {
    label: 'Worn',
    icon: Shirt,
    color: 'status-worn',
    bg: 'bg-accent/20',
  },
  'needs-wash': {
    label: 'Needs Wash',
    icon: AlertTriangle,
    color: 'status-wash',
    bg: 'bg-destructive/10',
  },
};

const Laundry = () => {
  const { items, updateLaundryStatus } = useWardrobe();
  const [filter, setFilter] = useState<LaundryStatus | 'all'>('all');

  const filteredItems = items.filter((item) =>
    filter === 'all' ? true : item.laundryStatus === filter
  );

  const stats = {
    clean: items.filter((i) => i.laundryStatus === 'clean').length,
    worn: items.filter((i) => i.laundryStatus === 'worn').length,
    needsWash: items.filter((i) => i.laundryStatus === 'needs-wash').length,
  };

  const markAllClean = () => {
    items
      .filter((i) => i.laundryStatus === 'needs-wash')
      .forEach((item) => updateLaundryStatus(item.id, 'clean'));
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-foreground">
            Laundry Tracker
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track the cleanliness status of your garments
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/20">
              <CheckCircle className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{stats.clean}</p>
              <p className="text-sm text-muted-foreground">Clean items</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/30">
              <Shirt className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{stats.worn}</p>
              <p className="text-sm text-muted-foreground">Worn items</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/20">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{stats.needsWash}</p>
              <p className="text-sm text-muted-foreground">Need washing</p>
            </div>
          </div>
        </motion.div>

        {/* Filter & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex gap-2">
            {(['all', 'clean', 'worn', 'needs-wash'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className={filter === status ? 'btn-primary' : ''}
              >
                {status === 'all' ? 'All Items' : status === 'needs-wash' ? 'Needs Wash' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
          
          {stats.needsWash > 0 && (
            <Button onClick={markAllClean} className="btn-primary">
              <WashingMachine className="w-4 h-4 mr-2" />
              Mark All Washed
            </Button>
          )}
        </motion.div>

        {/* Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredItems.map((item, index) => {
            const config = statusConfig[item.laundryStatus];
            return (
              <motion.div
                key={item.id}
                className={cn('glass-card p-4 flex items-center gap-4', config.bg)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Worn {item.usageCount} times • {item.fabric}
                  </p>
                  {item.careInstructions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Care: {item.careInstructions}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={config.color}>
                    <config.icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  <select
                    value={item.laundryStatus}
                    onChange={(e) => updateLaundryStatus(item.id, e.target.value as LaundryStatus)}
                    className="text-sm border rounded-lg px-3 py-2 bg-card"
                  >
                    <option value="clean">Mark Clean</option>
                    <option value="worn">Mark Worn</option>
                    <option value="needs-wash">Needs Wash</option>
                  </select>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Laundry;
