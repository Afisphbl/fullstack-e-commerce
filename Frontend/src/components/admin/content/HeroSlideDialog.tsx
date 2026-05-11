import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHeroSlide, updateHeroSlide, type HeroSlide } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface HeroSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: HeroSlide | null;
}

export default function HeroSlideDialog({
  open,
  onOpenChange,
  slide,
}: HeroSlideDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    order: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        buttonText: slide.buttonText || "Shop Now",
        buttonLink: slide.buttonLink || "/shop",
        order: slide.order,
        isActive: slide.isActive,
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        order: 0,
        isActive: true,
      });
    }
    setImageFile(null);
  }, [slide, open]);

  const createMutation = useMutation({
    mutationFn: createHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Hero slide created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create slide",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSlides"] });
      toast({
        title: "Success",
        description: "Hero slide updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update slide",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile && !formData.image) {
      toast({
        title: "Validation Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("subtitle", formData.subtitle);
    submitData.append("buttonText", formData.buttonText);
    submitData.append("buttonLink", formData.buttonLink);
    submitData.append("order", formData.order.toString());
    submitData.append("isActive", formData.isActive.toString());

    if (imageFile) {
      submitData.append("image", imageFile);
    }

    if (slide) {
      updateMutation.mutate({ id: slide._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {slide ? "Edit Hero Slide" : "Add Hero Slide"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUpload
            label="Slide Image *"
            value={formData.image}
            onChange={setImageFile}
            description="Upload hero slide image (recommended: 1920x800px)"
            maxSize={10}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Powerful Laptops"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle *</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Built for creators and pros"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                placeholder="Shop Now"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonLink">Button Link</Label>
              <Input
                id="buttonLink"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData({ ...formData, buttonLink: e.target.value })
                }
                placeholder="/shop"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {slide ? "Updating..." : "Creating..."}
                </>
              ) : slide ? (
                "Update Slide"
              ) : (
                "Create Slide"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
