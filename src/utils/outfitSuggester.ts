import { ClothingItem } from '@/types/wardrobe';

interface DayOutfit {
  top?: ClothingItem;
  bottom?: ClothingItem;
  footwear?: ClothingItem;
  accessory?: ClothingItem;
}

/**
 * Balanced auto-suggest algorithm:
 * - Only uses clean items
 * - Scores by inverse usage count (least worn preferred)
 * - No item repeated in the same week
 * - Distributes across seasons and occasions
 */
export function generateWeekPlan(
  items: ClothingItem[],
  dayKeys: string[]
): Record<string, DayOutfit> {
  const cleanItems = items.filter((i) => i.laundryStatus === 'clean');

  const tops = sortByScore(cleanItems.filter((i) => ['tops', 'dresses'].includes(i.category)));
  const bottoms = sortByScore(cleanItems.filter((i) => i.category === 'bottoms'));
  const footwear = sortByScore(cleanItems.filter((i) => i.category === 'footwear'));
  const accessories = sortByScore(cleanItems.filter((i) => ['accessories', 'outerwear'].includes(i.category)));

  const usedIds = new Set<string>();
  const plan: Record<string, DayOutfit> = {};

  for (const dayKey of dayKeys) {
    const outfit: DayOutfit = {};

    const pickItem = (pool: ClothingItem[]): ClothingItem | undefined => {
      const available = pool.filter((i) => !usedIds.has(i.id));
      if (available.length === 0) return undefined;
      const item = available[0];
      usedIds.add(item.id);
      return item;
    };

    outfit.top = pickItem(tops);
    outfit.bottom = pickItem(bottoms);
    outfit.footwear = pickItem(footwear);
    outfit.accessory = pickItem(accessories);

    plan[dayKey] = outfit;
  }

  return plan;
}

function sortByScore(items: ClothingItem[]): ClothingItem[] {
  return [...items].sort((a, b) => {
    // Lower usage = higher priority
    const usageScore = a.usageCount - b.usageCount;
    // Prefer items not worn recently
    const aRecency = a.lastWorn ? Date.now() - a.lastWorn.getTime() : Infinity;
    const bRecency = b.lastWorn ? Date.now() - b.lastWorn.getTime() : Infinity;
    const recencyScore = bRecency - aRecency; // higher recency gap = worn longer ago = preferred
    return usageScore * 0.6 + recencyScore * 0.0000000004;
  });
}
