import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClothingItem, Outfit, Category, LaundryStatus, WearEvent } from '@/types/wardrobe';
import { mockClothingItems, mockOutfits } from '@/data/mockData';
import { generateMockWearHistory } from '@/data/mockWearHistory';

interface WardrobeContextType {
  items: ClothingItem[];
  outfits: Outfit[];
  wearHistory: WearEvent[];
  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'usageCount'>) => void;
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

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>(mockClothingItems);
  const [outfits, setOutfits] = useState<Outfit[]>(mockOutfits);
  const [wearHistory, setWearHistory] = useState<WearEvent[]>(() => generateMockWearHistory());

  const addItem = (item: Omit<ClothingItem, 'id' | 'createdAt' | 'usageCount'>) => {
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      usageCount: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<ClothingItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLaundryStatus = (id: string, status: LaundryStatus) => {
    updateItem(id, { laundryStatus: status });
  };

  const getItemsByCategory = (category: Category) => {
    return items.filter((item) => item.category === category);
  };

  const getItemsByLaundryStatus = (status: LaundryStatus) => {
    return items.filter((item) => item.laundryStatus === status);
  };

  const addOutfit = (outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setOutfits((prev) => [...prev, newOutfit]);
  };

  const deleteOutfit = (id: string) => {
    setOutfits((prev) => prev.filter((outfit) => outfit.id !== id));
  };

  const logWear = (itemId: string, occasion: string, rating: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const event: WearEvent = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      category: item.category,
      occasion: occasion as any,
      date: new Date(),
      rating,
    };
    setWearHistory((prev) => [event, ...prev]);
    updateItem(itemId, { usageCount: item.usageCount + 1, lastWorn: new Date() });
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        outfits,
        wearHistory,
        addItem,
        updateItem,
        deleteItem,
        updateLaundryStatus,
        getItemsByCategory,
        getItemsByLaundryStatus,
        addOutfit,
        deleteOutfit,
        logWear,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}
