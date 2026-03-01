import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Category, Season, Occasion, LaundryStatus } from '@/types/wardrobe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useWardrobe();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    category: '' as Category,
    color: '',
    fabric: '',
    season: '' as Season,
    occasion: '' as Occasion,
    careInstructions: '',
    laundryStatus: 'clean' as LaundryStatus,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in at least the name and category.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    let finalImage = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=500&fit=crop';

    if (imageFile && user) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(filePath);
      finalImage = urlData.publicUrl;
    }

    await addItem({
      ...formData,
      image: finalImage,
      laundryStatus: formData.laundryStatus,
    });

    toast({
      title: 'Item added!',
      description: `${formData.name} has been added to your wardrobe.`,
    });

    setUploading(false);
    navigate('/wardrobe');
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Add New Item
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add a new clothing item to your digital wardrobe
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Upload */}
            <div className="glass-card p-6">
              <Label className="text-base font-semibold mb-4 block">Item Photo</Label>
              <div
                className={`relative aspect-[3/4] rounded-lg border-2 border-dashed transition-colors ${
                  imagePreview ? 'border-transparent' : 'border-border hover:border-primary/50'
                } flex items-center justify-center overflow-hidden bg-muted/30`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer p-8 text-center">
                    <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="text-sm font-medium text-foreground">
                      Upload Photo
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Click or drag and drop
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="glass-card p-6 space-y-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., White Cotton Shirt"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as Category }))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="footwear">Footwear</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., Navy Blue"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabric">Fabric</Label>
                    <Input
                      id="fabric"
                      value={formData.fabric}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fabric: e.target.value }))}
                      placeholder="e.g., Cotton"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Season</Label>
                    <Select
                      value={formData.season}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, season: value as Season }))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                        <SelectItem value="all">All Seasons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Occasion</Label>
                  <Select
                    value={formData.occasion}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, occasion: value as Occasion }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="care">Care Instructions</Label>
                  <Textarea
                    id="care"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, careInstructions: e.target.value }))}
                    placeholder="e.g., Machine wash cold, tumble dry low"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button type="submit" className="w-full btn-primary py-6 text-base" disabled={uploading}>
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {uploading ? 'Uploading...' : 'Add to Wardrobe'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.form>
      </div>
    </MainLayout>
  );
};

export default AddItem;
