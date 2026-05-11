import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSEOSettings, updateSEOSettings, uploadOGImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "./ImageUpload";
import { Badge } from "@/components/ui/badge";

const PAGES = [
  { value: "home", label: "Home Page" },
  { value: "shop", label: "Shop Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
  { value: "faq", label: "FAQ Page" },
  { value: "blog", label: "Blog Page" },
];

const TWITTER_CARD_TYPES = [
  { value: "summary", label: "Summary" },
  { value: "summary_large_image", label: "Summary Large Image" },
  { value: "app", label: "App" },
  { value: "player", label: "Player" },
];

export default function AdminSEOSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState("home");

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["seoSettings", selectedPage],
    queryFn: () => fetchSEOSettings(selectedPage),
    enabled: !!selectedPage,
  });

  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [] as string[],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    canonicalUrl: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (seoSettings) {
      setFormData({
        metaTitle: seoSettings.metaTitle || "",
        metaDescription: seoSettings.metaDescription || "",
        metaKeywords: seoSettings.metaKeywords || [],
        ogTitle: seoSettings.ogTitle || "",
        ogDescription: seoSettings.ogDescription || "",
        ogImage: seoSettings.ogImage || "",
        twitterCard: seoSettings.twitterCard || "summary_large_image",
        canonicalUrl: seoSettings.canonicalUrl || "",
      });
    }
  }, [seoSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSEOSettings(selectedPage, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seoSettings", selectedPage] });
      toast({
        title: "Success",
        description: "SEO settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SEO settings",
        variant: "destructive",
      });
    },
  });

  const ogImageMutation = useMutation({
    mutationFn: (file: File) => uploadOGImage(selectedPage, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seoSettings", selectedPage] });
      toast({
        title: "Success",
        description: "OG image uploaded successfully",
      });
      setOgImageFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload OG image",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload OG image if changed
    if (ogImageFile) {
      await ogImageMutation.mutateAsync(ogImageFile);
    }

    // Update SEO settings
    updateMutation.mutate(formData);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.metaKeywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        metaKeywords: [...formData.metaKeywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      metaKeywords: formData.metaKeywords.filter((k) => k !== keyword),
    });
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Settings</h2>
          <p className="text-muted-foreground">
            Manage meta tags and SEO for each page
          </p>
        </div>
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((page) => (
              <SelectItem key={page.value} value={page.value}>
                {page.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Meta Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Meta Tags</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title *</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="VoltEdge - Premium Electronics Store"
                required
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.metaTitle.length}/60 characters (recommended: 50-60)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description *</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Discover cutting-edge electronics and premium gadgets..."
                rows={3}
                required
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.metaDescription.length}/160 characters (recommended: 150-160)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Meta Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  placeholder="Add keyword and press Enter"
                />
                <Button type="button" onClick={handleAddKeyword}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.metaKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, canonicalUrl: e.target.value })
                }
                placeholder="https://voltedge.com/shop"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Open Graph Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Open Graph (Facebook)</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ogTitle">OG Title</Label>
              <Input
                id="ogTitle"
                value={formData.ogTitle}
                onChange={(e) =>
                  setFormData({ ...formData, ogTitle: e.target.value })
                }
                placeholder="Leave empty to use Meta Title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogDescription">OG Description</Label>
              <Textarea
                id="ogDescription"
                value={formData.ogDescription}
                onChange={(e) =>
                  setFormData({ ...formData, ogDescription: e.target.value })
                }
                placeholder="Leave empty to use Meta Description"
                rows={3}
              />
            </div>

            <ImageUpload
              label="OG Image"
              value={formData.ogImage}
              onChange={setOgImageFile}
              description="Recommended: 1200x630px"
              maxSize={5}
            />
          </div>
        </div>

        <Separator />

        {/* Twitter Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Twitter Card</h3>
          <div className="space-y-2">
            <Label htmlFor="twitterCard">Card Type</Label>
            <Select
              value={formData.twitterCard}
              onValueChange={(value) =>
                setFormData({ ...formData, twitterCard: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TWITTER_CARD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Preview</h3>
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="text-blue-600 text-lg font-medium">
              {formData.metaTitle || "Your Page Title"}
            </div>
            <div className="text-green-700 text-sm mt-1">
              {formData.canonicalUrl || "https://yoursite.com/page"}
            </div>
            <div className="text-gray-600 text-sm mt-2">
              {formData.metaDescription || "Your meta description will appear here..."}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending || ogImageMutation.isPending}
            className="gap-2"
          >
            {(updateMutation.isPending || ogImageMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
