import { WearEvent, Category, Occasion } from '@/types/wardrobe';
import { mockClothingItems } from './mockData';
import { subDays, startOfDay } from 'date-fns';

export function generateMockWearHistory(): WearEvent[] {
  const events: WearEvent[] = [];
  const now = new Date();
  const occasions: Occasion[] = ['casual', 'formal', 'work', 'sport', 'party', 'date'];

  // Generate ~60 wear events over the past 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = startOfDay(subDays(now, dayOffset));
    // 1-3 items worn per day
    const itemsPerDay = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...mockClothingItems].sort(() => Math.random() - 0.5);

    for (let i = 0; i < itemsPerDay && i < shuffled.length; i++) {
      const item = shuffled[i];
      events.push({
        id: `wear-${dayOffset}-${i}`,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        occasion: occasions[Math.floor(Math.random() * occasions.length)],
        date,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
      });
    }
  }

  return events;
}
