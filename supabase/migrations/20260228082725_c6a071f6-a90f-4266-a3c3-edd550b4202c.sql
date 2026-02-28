
-- Create clothing_items table
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT DEFAULT '',
  fabric TEXT DEFAULT '',
  season TEXT DEFAULT 'all',
  occasion TEXT DEFAULT 'casual',
  laundry_status TEXT DEFAULT 'clean',
  usage_count INTEGER DEFAULT 0,
  care_instructions TEXT DEFAULT '',
  last_worn TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own items"
  ON public.clothing_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON public.clothing_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.clothing_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.clothing_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create wear_history table
CREATE TABLE public.wear_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  occasion TEXT NOT NULL,
  rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wear history"
  ON public.wear_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wear history"
  ON public.wear_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wear history"
  ON public.wear_history FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clothing_items_updated_at
  BEFORE UPDATE ON public.clothing_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
