import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { ClothingItem } from '@/types/wardrobe';
import { format, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Sparkles, Wand2 } from 'lucide-react';
import { generateWeekPlan } from '@/utils/outfitSuggester';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DayOutfit {
  top?: ClothingItem;
  bottom?: ClothingItem;
  footwear?: ClothingItem;
  accessory?: ClothingItem;
}

const WeeklyPlanner = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekPlan, setWeekPlan] = useState<Record<string, DayOutfit>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectingSlot, setSelectingSlot] = useState<keyof DayOutfit | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const addToOutfit = (dayKey: string, slot: keyof DayOutfit, item: ClothingItem) => {
    setWeekPlan((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [slot]: item,
      },
    }));
    setSelectingSlot(null);
  };

  const removeFromOutfit = (dayKey: string, slot: keyof DayOutfit) => {
    setWeekPlan((prev) => {
      const dayOutfit = { ...prev[dayKey] };
      delete dayOutfit[slot];
      return {
        ...prev,
        [dayKey]: dayOutfit,
      };
    });
  };

  const getAvailableItems = (slot: keyof DayOutfit) => {
    const categoryMap: Record<string, string[]> = {
      top: ['tops', 'dresses'],
      bottom: ['bottoms'],
      footwear: ['footwear'],
      accessory: ['accessories', 'outerwear'],
    };
    return items.filter((item) => categoryMap[slot]?.includes(item.category));
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
            Weekly Planner
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Plan your outfits for the week ahead
          </p>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <Button variant="outline" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Week
          </Button>
          <h2 className="font-display text-xl font-semibold">
            {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
          </h2>
          <Button variant="outline" onClick={() => navigateWeek('next')}>
            Next Week
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Week Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-7 gap-4"
        >
          {weekDays.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayOutfit = weekPlan[dayKey] || {};

            return (
              <motion.div
                key={dayKey}
                className={`glass-card p-4 min-h-[400px] ${isToday ? 'ring-2 ring-primary' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">{format(day, 'EEE')}</p>
                  <p className={`text-2xl font-display font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Outfit Slots */}
                <div className="space-y-3">
                  {(['top', 'bottom', 'footwear', 'accessory'] as const).map((slot) => (
                    <div key={slot} className="relative">
                      {dayOutfit[slot] ? (
                        <div className="relative group">
                          <img
                            src={dayOutfit[slot]!.image}
                            alt={dayOutfit[slot]!.name}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <button
                            onClick={() => removeFromOutfit(dayKey, slot)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => {
                                setSelectedDay(dayKey);
                                setSelectingSlot(slot);
                              }}
                            >
                              <Plus className="w-5 h-5" />
                              <span className="text-xs mt-1 capitalize">{slot}</span>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-display text-xl capitalize">
                                Select {slot}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                              {getAvailableItems(slot).map((item) => (
                                <motion.button
                                  key={item.id}
                                  className="group relative aspect-square rounded-lg overflow-hidden"
                                  onClick={() => addToOutfit(dayKey, slot, item)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-primary-foreground text-sm font-medium">
                                      Select
                                    </span>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* AI Suggestion */}
        <motion.div
          className="mt-8 glass-card p-6 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Need outfit ideas?</h3>
              <p className="text-sm text-muted-foreground">
                Let our AI stylist create a week of outfits for you
              </p>
            </div>
          </div>
          <Button
            className="btn-primary"
            onClick={() => {
              const dayKeys = weekDays.map((d) => format(d, 'yyyy-MM-dd'));
              const plan = generateWeekPlan(items, dayKeys);
              setWeekPlan((prev) => ({ ...prev, ...plan }));
              toast({ title: 'Week planned!', description: 'Outfits auto-suggested based on your wardrobe.' });
            }}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Plan Week
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default WeeklyPlanner;
