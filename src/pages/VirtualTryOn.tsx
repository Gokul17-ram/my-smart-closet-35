import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { ClothingItem, Category } from '@/types/wardrobe';
import { Upload, X, User, Shirt, Footprints, Watch, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slotConfig: { key: string; label: string; categories: Category[]; icon: React.ElementType }[] = [
  { key: 'top', label: 'Top', categories: ['tops'], icon: Shirt },
  { key: 'bottom', label: 'Bottom', categories: ['bottoms'], icon: ChevronDown },
  { key: 'dress', label: 'Dress', categories: ['dresses'], icon: Shirt },
  { key: 'footwear', label: 'Footwear', categories: ['footwear'], icon: Footprints },
  { key: 'accessory', label: 'Accessory', categories: ['accessories', 'outerwear'], icon: Watch },
];

const VirtualTryOn = () => {
  const { items } = useWardrobe();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, ClothingItem>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectItem = (slot: string, item: ClothingItem) => {
    setSelectedItems((prev) => ({ ...prev, [slot]: item }));
    setActiveSlot(null);
  };

  const removeItem = (slot: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const selectedList = Object.values(selectedItems);

  return (
    <MainLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Virtual Try-On</h1>
          <p className="mt-2 text-lg text-muted-foreground">Upload your photo and preview outfit combinations</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photo Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Your Photo</h2>
            {userPhoto ? (
              <div className="relative group">
                <img src={userPhoto} alt="User" className="w-full rounded-lg object-cover aspect-[3/4]" />
                <button
                  onClick={() => setUserPhoto(null)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors gap-3"
              >
                <Upload className="w-10 h-10" />
                <span className="font-medium">Upload Your Photo</span>
                <span className="text-sm">JPG, PNG up to 10MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </motion.div>

          {/* Center: Preview Composite */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Outfit Preview</h2>
            {selectedList.length === 0 && !userPhoto ? (
              <div className="w-full aspect-[3/4] rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground gap-3">
                <User className="w-16 h-16" />
                <p className="text-center text-sm">Upload your photo and select items to see a preview</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User photo thumbnail */}
                {userPhoto && (
                  <div className="flex justify-center">
                    <img src={userPhoto} alt="You" className="w-32 h-40 rounded-lg object-cover border-2 border-primary/30" />
                  </div>
                )}
                {/* Selected outfit grid */}
                {selectedList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedList.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-lg overflow-hidden border border-border"
                      >
                        <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm px-2 py-1">
                          <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Select clothing items from the right panel →</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Right: Item Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Select Items</h2>
            <div className="space-y-3">
              {slotConfig.map((slot) => {
                const selected = selectedItems[slot.key];
                const available = items.filter((i) => slot.categories.includes(i.category) && i.laundryStatus === 'clean');

                return (
                  <div key={slot.key}>
                    <button
                      onClick={() => setActiveSlot(activeSlot === slot.key ? null : slot.key)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                        selected
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <slot.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left font-medium text-foreground">
                        {selected ? selected.name : `Add ${slot.label}`}
                      </span>
                      {selected && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeItem(slot.key); }}
                          className="p-1 rounded-full hover:bg-destructive/10 text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </button>

                    <AnimatePresence>
                      {activeSlot === slot.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            {available.length > 0 ? available.map((item) => (
                              <motion.button
                                key={item.id}
                                className="relative aspect-square rounded-lg overflow-hidden group border border-border hover:border-primary/50"
                                onClick={() => selectItem(slot.key, item)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs font-medium">Select</span>
                                </div>
                              </motion.button>
                            )) : (
                              <p className="col-span-3 text-sm text-muted-foreground py-2 text-center">No clean items available</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VirtualTryOn;
