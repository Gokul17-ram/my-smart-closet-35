import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ClothingItem, Outfit, Category, LaundryStatus, WearEvent } from '@/types/wardrobe';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockOutfits } from '@/data/mockData';

interface WardrobeContextType {
  items: ClothingItem[];
  outfits: Outfit[];
  wearHistory: WearEvent[];
  loading: boolean;
  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => void;
  deleteItem: (id: string) => void;
  updateLaundryStatus: (id: string, status: LaundryStatus) => void;
  getItemsByCategory: (category: Category) => ClothingItem[];
  getItemsByLaundryStatus: (status: LaundryStatus) => ClothingItem[];
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  deleteOutfit: (id: string) => void;
  logWear: (itemId: string, occasion: string, rating: number) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

function mapDbToItem(row: any): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    category: row.category as Category,
    color: row.color || '',
    fabric: row.fabric || '',
    season: row.season || 'all',
    occasion: row.occasion || 'casual',
    laundryStatus: (row.laundry_status || 'clean') as LaundryStatus,
    usageCount: row.usage_count || 0,
    careInstructions: row.care_instructions || '',
    createdAt: new Date(row.created_at),
    lastWorn: row.last_worn ? new Date(row.last_worn) : undefined,
  };
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>(mockOutfits);
  const [wearHistory, setWearHistory] = useState<WearEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data.map(mapDbToItem));
    setLoading(false);
  }, [user]);

  const fetchWearHistory = useCallback(async () => {
    if (!user) { setWearHistory([]); return; }
    const { data, error } = await supabase
      .from('wear_history')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) {
      setWearHistory(data.map((r: any) => ({
        id: r.id,
        itemId: r.item_id,
        itemName: r.item_name,
        category: r.category as Category,
        occasion: r.occasion as any,
        date: new Date(r.date),
        rating: r.rating,
      })));
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
    fetchWearHistory();
  }, [fetchItems, fetchWearHistory]);

  const addItem = async (item: Omit<ClothingItem, 'id' | 'createdAt' | 'usageCount'>) => {
    if (!user) return;
    const { error } = await supabase.from('clothing_items').insert({
      user_id: user.id,
      name: item.name,
      image: item.image,
      category: item.category,
      color: item.color,
      fabric: item.fabric,
      season: item.season,
      occasion: item.occasion,
      laundry_status: item.laundryStatus,
      care_instructions: item.careInstructions,
    });
    if (!error) await fetchItems();
  };

  const updateItem = async (id: string, updates: Partial<ClothingItem>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.fabric !== undefined) dbUpdates.fabric = updates.fabric;
    if (updates.season !== undefined) dbUpdates.season = updates.season;
    if (updates.occasion !== undefined) dbUpdates.occasion = updates.occasion;
    if (updates.laundryStatus !== undefined) dbUpdates.laundry_status = updates.laundryStatus;
    if (updates.careInstructions !== undefined) dbUpdates.care_instructions = updates.careInstructions;
    if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;
    if (updates.lastWorn !== undefined) dbUpdates.last_worn = updates.lastWorn;

    const { error } = await supabase.from('clothing_items').update(dbUpdates).eq('id', id);
    if (!error) await fetchItems();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('clothing_items').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateLaundryStatus = (id: string, status: LaundryStatus) => {
    updateItem(id, { laundryStatus: status });
  };

  const getItemsByCategory = (category: Category) => items.filter((i) => i.category === category);
  const getItemsByLaundryStatus = (status: LaundryStatus) => items.filter((i) => i.laundryStatus === status);

  const addOutfit = (outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    setOutfits((prev) => [...prev, { ...outfit, id: Date.now().toString(), createdAt: new Date() }]);
  };

  const deleteOutfit = (id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  const logWear = async (itemId: string, occasion: string, rating: number) => {
    if (!user) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const { error } = await supabase.from('wear_history').insert({
      user_id: user.id,
      item_id: itemId,
      item_name: item.name,
      category: item.category,
      occasion,
      rating,
    });
    if (!error) {
      await fetchWearHistory();
      await updateItem(itemId, { usageCount: item.usageCount + 1, lastWorn: new Date() });
    }
  };

  return (
    <WardrobeContext.Provider
      value={{
        items, outfits, wearHistory, loading,
        addItem, updateItem, deleteItem, updateLaundryStatus,
        getItemsByCategory, getItemsByLaundryStatus,
        addOutfit, deleteOutfit, logWear,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (context === undefined) throw new Error('useWardrobe must be used within a WardrobeProvider');
  return context;
}
