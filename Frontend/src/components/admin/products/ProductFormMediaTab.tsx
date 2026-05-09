import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, useWatch } from "react-hook-form";
import { ProductFormValues } from "./hooks/useProductForm";
import { ImageIcon, X, Plus } from "lucide-react";

interface ProductFormMediaTabProps {
  control: Control<ProductFormValues>;
}

export const ProductFormMediaTab = ({ control }: ProductFormMediaTabProps) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<(File | string)[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const imageCover = useWatch({ control, name: "imageCover" });
  const images = useWatch({ control, name: "images" });

  // Handle Cover Preview
  useEffect(() => {
    if (imageCover instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(imageCover);
    } else if (typeof imageCover === "string" && imageCover) {
      setCoverPreview(imageCover);
    } else {
      setCoverPreview(null);
    }
  }, [imageCover]);

  // Sync images from form (initial load)
  useEffect(() => {
    if (images && galleryItems.length === 0) {
      if (typeof images === "string") {
        const urls = images.split(",").map(s => s.trim()).filter(Boolean);
        setGalleryItems(urls);
      } else if (Array.isArray(images)) {
        setGalleryItems(images);
      }
    }
  }, [images]);

  // Generate Gallery Previews
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews = await Promise.all(
        galleryItems.map(async (item) => {
          if (item instanceof File) {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(item);
            });
          }
          return item;
        })
      );
      setPreviews(newPreviews);
    };
    generatePreviews();
  }, [galleryItems]);

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="imageCover"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div 
                  className="relative group aspect-video rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                >
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Change Cover</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(undefined);
                          setCoverPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-background shadow-sm border border-border mb-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click to upload cover image</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP (max 5MB)</p>
                    </>
                  )}
                </div>
                <Input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="images"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel>Gallery Images ({galleryItems.length}/5)</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div 
                  className="relative group min-h-[120px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (galleryItems.length < 5) {
                      document.getElementById('gallery-upload')?.click();
                    }
                  }}
                >
                  {galleryItems.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {previews.map((preview, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border shadow-sm group/item">
                          <img src={preview} alt={`Gallery preview ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newItems = galleryItems.filter((_, index) => index !== i);
                              setGalleryItems(newItems);
                              onChange(newItems);
                            }}
                            className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur rounded-full text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {galleryItems.length < 5 && (
                        <div className="aspect-square rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-background/50 transition-colors">
                          <Plus className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="p-2 rounded-full bg-background shadow-sm border border-border mb-2">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click to upload gallery images</p>
                      <p className="text-xs text-muted-foreground mt-1">Up to 5 images allowed</p>
                    </div>
                  )}
                </div>
                <Input
                  id="gallery-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      const combined = [...galleryItems, ...newFiles].slice(0, 5);
                      setGalleryItems(combined);
                      onChange(combined);
                    }
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};


