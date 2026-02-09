import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentItems } from '@/components/dashboard/RecentItems';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { Shirt, WashingMachine, Calendar, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { items } = useWardrobe();
  
  const stats = {
    totalItems: items.length,
    needsWash: items.filter((i) => i.laundryStatus === 'needs-wash').length,
    worn: items.filter((i) => i.laundryStatus === 'worn').length,
    outfitsPlanned: 5,
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
            Good morning!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Here's an overview of your wardrobe today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            subtitle="In your wardrobe"
            icon={Shirt}
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <StatCard
            title="Needs Washing"
            value={stats.needsWash}
            subtitle="Items to clean"
            icon={WashingMachine}
            delay={0.1}
          />
          <StatCard
            title="Recently Worn"
            value={stats.worn}
            subtitle="This week"
            icon={Shirt}
            delay={0.2}
          />
          <StatCard
            title="Outfits Planned"
            value={stats.outfitsPlanned}
            subtitle="This week"
            icon={Calendar}
            delay={0.3}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </motion.div>

        {/* Recent Items */}
        <RecentItems />

        {/* AI Suggestion Banner */}
        <motion.div
          className="mt-8 relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, hsl(15 45% 65%) 0%, hsl(25 50% 75%) 100%)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">
              Try AI Outfit Suggestions
            </h3>
            <p className="text-primary-foreground/90 max-w-md mb-4">
              Let our AI stylist create personalized outfit recommendations based on your wardrobe and preferences.
            </p>
            <motion.button
              className="px-6 py-3 rounded-lg bg-card text-foreground font-semibold hover:bg-card/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Recommendations
            </motion.button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
