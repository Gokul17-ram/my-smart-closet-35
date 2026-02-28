export type Category = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'footwear' | 'accessories';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
export type Occasion = 'casual' | 'formal' | 'work' | 'sport' | 'party' | 'date';
export type LaundryStatus = 'clean' | 'worn' | 'needs-wash';

export interface ClothingItem {
  id: string;
  name: string;
  image: string;
  category: Category;
  color: string;
  fabric: string;
  season: Season;
  occasion: Occasion;
  laundryStatus: LaundryStatus;
  usageCount: number;
  careInstructions: string;
  createdAt: Date;
  lastWorn?: Date;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: Occasion;
  createdAt: Date;
}

export interface DayPlan {
  date: Date;
  outfit?: Outfit;
  items?: ClothingItem[];
}

export interface WeekPlan {
  weekStart: Date;
  days: DayPlan[];
}

export interface WearEvent {
  id: string;
  itemId: string;
  itemName: string;
  category: Category;
  occasion: Occasion;
  date: Date;
  rating: number; // 1-5
}
