import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SiteSettings, HeroSlide } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";

interface HeroSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const HeroSettings = ({ draft, update }: HeroSettingsProps) => {
  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const next = [...draft.heroSlides];
    next[idx] = { ...next[idx], ...patch };
    update("heroSlides", next);
  };

  const addSlide = () =>
    update("heroSlides", [
      ...draft.heroSlides,
      { image: "", title: "New Slide", subtitle: "" },
    ]);

  const removeSlide = (idx: number) =>
    update(
      "heroSlides",
      draft.heroSlides.filter((_, i) => i !== idx)
    );

  const handleSlideImageUpload = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide(idx, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Homepage Hero Content</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Eyebrow / Badge">
            <Input
              value={draft.heroEyebrow}
              onChange={(e) => update("heroEyebrow", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label="CTA Button Text">
            <Input
              value={draft.heroCtaText}
              onChange={(e) => update("heroCtaText", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label="Headline (start)">
            <Input
              value={draft.heroTitle}
              onChange={(e) => update("heroTitle", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label="Highlighted Word" hint="Rendered with gradient.">
            <Input
              value={draft.heroHighlight}
              onChange={(e) => update("heroHighlight", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label="CTA Link">
            <Input
              value={draft.heroCtaLink}
              onChange={(e) => update("heroCtaLink", e.target.value)}
              placeholder="/shop"
              className="bg-background"
            />
          </Field>
        </div>
        <Field label="Subtitle">
          <Textarea
            value={draft.heroSubtitle}
            onChange={(e) => update("heroSubtitle", e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>

      {/* Hero Slideshow */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hero Slideshow</h3>
        <div className="space-y-3">
          {draft.heroSlides.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  SLIDE {i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlide(i)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  placeholder="Title"
                  value={s.title}
                  onChange={(e) => updateSlide(i, { title: e.target.value })}
                />
                <Input
                  placeholder="Subtitle"
                  value={s.subtitle}
                  onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                />
              </div>
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Slide Image
                </Label>
                <div
                  className="relative group aspect-video rounded-lg border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById(`slide-upload-${i}`)?.click()
                  }
                >
                  {s.image ? (
                    <>
                      <img
                        src={s.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">
                          Change Image
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove slide image"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSlide(i, { image: "" });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-full bg-background shadow-sm border border-border mb-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or WebP
                      </p>
                    </>
                  )}
                </div>
                <Input
                  id={`slide-upload-${i}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSlideImageUpload(i, e)}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSlide}>
            <Plus className="h-4 w-4 mr-2" /> Add Slide
          </Button>
        </div>
      </div>
    </div>
  );
};
