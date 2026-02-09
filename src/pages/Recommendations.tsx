import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { ClothingItem, Occasion } from '@/types/wardrobe';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, RefreshCw, Heart, ThumbsDown, Check, Sun, Cloud, Umbrella } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OutfitSuggestion {
  id: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  footwear?: ClothingItem;
  accessory?: ClothingItem;
  occasion: Occasion;
  confidence: number;
}

const Recommendations = () => {
  const { items } = useWardrobe();
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Simulated AI recommendations
    setTimeout(() => {
      const tops = items.filter((i) => i.category === 'tops');
      const bottoms = items.filter((i) => i.category === 'bottoms');
      const footwear = items.filter((i) => i.category === 'footwear');
      const accessories = items.filter((i) => ['accessories', 'outerwear'].includes(i.category));

      const newSuggestions: OutfitSuggestion[] = [];
      
      for (let i = 0; i < 3; i++) {
        newSuggestions.push({
          id: `suggestion-${Date.now()}-${i}`,
          top: tops[Math.floor(Math.random() * tops.length)],
          bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
          footwear: footwear[Math.floor(Math.random() * footwear.length)],
          accessory: accessories[Math.floor(Math.random() * accessories.length)],
          occasion,
          confidence: 75 + Math.floor(Math.random() * 20),
        });
      }

      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, 1500);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const weatherIcons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: Umbrella,
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
            AI Stylist
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Get personalized outfit recommendations based on your wardrobe
          </p>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="font-display text-lg font-semibold mb-4">Set Your Preferences</h2>
          <div className="flex flex-wrap gap-6 items-end">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Occasion</label>
              <Select value={occasion} onValueChange={(v) => setOccasion(v as Occasion)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="sport">Sport</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Weather</label>
              <div className="flex gap-2">
                {(['sunny', 'cloudy', 'rainy'] as const).map((w) => {
                  const Icon = weatherIcons[w];
                  return (
                    <Button
                      key={w}
                      variant={weather === w ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setWeather(w)}
                      className={weather === w ? 'btn-primary' : ''}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="btn-primary px-8"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </div>
        </motion.div>

        {/* Suggestions */}
        <AnimatePresence mode="popLayout">
          {suggestions.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Ready to style you!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Set your preferences above and click "Get Suggestions" to receive personalized outfit recommendations from our AI stylist.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  className="glass-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  {/* Outfit Preview */}
                  <div className="grid grid-cols-2 gap-1 p-2 bg-muted/30">
                    {suggestion.top && (
                      <img
                        src={suggestion.top.image}
                        alt={suggestion.top.name}
                        className="w-full aspect-square rounded object-cover"
                      />
                    )}
                    {suggestion.bottom && (
                      <img
                        src={suggestion.bottom.image}
                        alt={suggestion.bottom.name}
                        className="w-full aspect-square rounded object-cover"
                      />
                    )}
                    {suggestion.footwear && (
                      <img
                        src={suggestion.footwear.image}
                        alt={suggestion.footwear.name}
                        className="w-full aspect-square rounded object-cover"
                      />
                    )}
                    {suggestion.accessory && (
                      <img
                        src={suggestion.accessory.image}
                        alt={suggestion.accessory.name}
                        className="w-full aspect-square rounded object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {suggestion.occasion}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {suggestion.confidence}% match
                      </span>
                    </div>

                    <div className="space-y-1 text-sm mb-4">
                      {suggestion.top && <p><span className="text-muted-foreground">Top:</span> {suggestion.top.name}</p>}
                      {suggestion.bottom && <p><span className="text-muted-foreground">Bottom:</span> {suggestion.bottom.name}</p>}
                      {suggestion.footwear && <p><span className="text-muted-foreground">Shoes:</span> {suggestion.footwear.name}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleLike(suggestion.id)}
                      >
                        {liked.has(suggestion.id) ? (
                          <Check className="w-4 h-4 mr-1 text-secondary-foreground" />
                        ) : (
                          <Heart className="w-4 h-4 mr-1" />
                        )}
                        {liked.has(suggestion.id) ? 'Saved' : 'Save'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Virtual Try-On Placeholder */}
        <motion.div
          className="mt-12 glass-card p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👔</span>
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
            Virtual Try-On
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            Preview how outfits will look on you with our AI-powered virtual try-on feature.
            Upload your photo to get started.
          </p>
          <Button className="btn-primary">
            Coming Soon
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Recommendations;
