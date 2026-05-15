import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SiteSettings, HeroSlide } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { UploadResponse } from "@/lib/api";

interface HeroSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => void;
}

// Helper component for multilingual text input
const MultilingualField = ({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: { am: string; en: string; om: string } | string;
  onChange: (val: { am: string; en: string; om: string }) => void;
  hint?: string;
}) => {
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            አማርኛ (Amharic)
          </label>
          <Input
            value={multiValue.am}
            onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
            className="bg-background font-sans"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            English
          </label>
          <Input
            value={multiValue.en}
            onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
            className="bg-background"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            Afaan Oromo
          </label>
          <Input
            value={multiValue.om}
            onChange={(e) => onChange({ ...multiValue, om: e.target.value })}
            className="bg-background"
          />
        </div>
      </div>
    </Field>
  );
};

const MultilingualTextareaField = ({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: { am: string; en: string; om: string } | string;
  onChange: (val: { am: string; en: string; om: string }) => void;
  hint?: string;
}) => {
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            አማርኛ (Amharic)
          </label>
          <Textarea
            value={multiValue.am}
            onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
            className="bg-background font-sans resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            English
          </label>
          <Textarea
            value={multiValue.en}
            onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
            className="bg-background resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            Afaan Oromo
          </label>
          <Textarea
            value={multiValue.om}
            onChange={(e) => onChange({ ...multiValue, om: e.target.value })}
            className="bg-background resize-none"
          />
        </div>
      </div>
    </Field>
  );
};

// Helper for multilingual slide fields
const MultilingualSlideInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: { am: string; en: string; om: string } | string;
  onChange: (val: { am: string; en: string; om: string }) => void;
  placeholder?: string;
}) => {
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
        <Input
          placeholder={`${placeholder} (አማርኛ)`}
          value={multiValue.am}
          onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
          className="text-sm font-sans"
        />
        <Input
          placeholder={`${placeholder} (English)`}
          value={multiValue.en}
          onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
          className="text-sm"
        />
        <Input
          placeholder={`${placeholder} (Afaan Oromo)`}
          value={multiValue.om}
          onChange={(e) => onChange({ ...multiValue, om: e.target.value })}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export const HeroSettings = ({ draft, update }: HeroSettingsProps) => {
  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const next = [...draft.heroSlides];
    next[idx] = { ...next[idx], ...patch };
    update("heroSlides", next);
  };

  const addSlide = () =>
    update("heroSlides", [
      ...draft.heroSlides,
      { 
        image: "", 
        title: { am: "አዲስ ስላይድ", en: "New Slide", om: "Slide Haaraa" }, 
        subtitle: { am: "", en: "", om: "" } 
      },
    ]);

  const removeSlide = (idx: number) =>
    update(
      "heroSlides",
      draft.heroSlides.filter((_, i) => i !== idx),
    );

  const handleSlideImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const toastId = toast.loading("Uploading image...");
      try {
        const response = await apiFetch<UploadResponse>("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status === "success") {
          updateSlide(idx, { image: response.url });
          toast.success("Image uploaded successfully!", { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Failed to upload image", { id: toastId });
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Hero Content */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Homepage Hero Content</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <MultilingualField
            label='Eyebrow / Badge'
            value={draft.heroEyebrow}
            onChange={(val) => update("heroEyebrow", val)}
          />
          <MultilingualField
            label='CTA Button Text'
            value={draft.heroCtaText}
            onChange={(val) => update("heroCtaText", val)}
          />
          <MultilingualField
            label='Headline (start)'
            value={draft.heroTitle}
            onChange={(val) => update("heroTitle", val)}
          />
          <MultilingualField
            label='Highlighted Word'
            hint='Rendered with gradient.'
            value={draft.heroHighlight}
            onChange={(val) => update("heroHighlight", val)}
          />
          <Field label='CTA Link'>
            <Input
              value={draft.heroCtaLink}
              onChange={(e) => update("heroCtaLink", e.target.value)}
              placeholder='/shop'
              className='bg-background'
            />
          </Field>
        </div>
        <MultilingualTextareaField
          label='Subtitle'
          value={draft.heroSubtitle}
          onChange={(val) => update("heroSubtitle", val)}
        />
      </div>

      {/* Hero Slideshow */}
      <div className='space-y-4 grid place-content-center'>
        <h3 className='text-lg font-semibold'>Hero Slideshow</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {draft.heroSlides.map((s, i) => (
            <div
              key={i}
              className='rounded-lg border border-border bg-background p-4'
            >
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-semibold text-muted-foreground'>
                  SLIDE {i + 1}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeSlide(i)}
                  className='text-destructive'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='grid grid-cols-1 gap-4'>
                {/* Multilingual Text Fields */}
                <div className='space-y-3'>
                  <MultilingualSlideInput
                    label='Title'
                    value={s.title}
                    onChange={(val) => updateSlide(i, { title: val })}
                    placeholder='Slide title'
                  />
                  <MultilingualSlideInput
                    label='Subtitle'
                    value={s.subtitle}
                    onChange={(val) => updateSlide(i, { subtitle: val })}
                    placeholder='Slide subtitle'
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label className='text-xs text-muted-foreground mb-2 block'>
                    Slide Image
                  </Label>
                  <div
                    className='relative group aspect-video rounded-lg border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer'
                    onClick={() =>
                      document.getElementById(`slide-upload-${i}`)?.click()
                    }
                  >
                    {s.image ? (
                      <>
                        <img
                          src={s.image}
                          alt=''
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <p className='text-white text-xs font-medium'>
                            Change
                          </p>
                        </div>
                        <button
                          type='button'
                          aria-label='Remove slide image'
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSlide(i, { image: "" });
                          }}
                          className='absolute top-1 right-1 p-1 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className='p-2 rounded-full bg-background shadow-sm border border-border mb-1'>
                          <Upload className='h-3 w-3 text-muted-foreground' />
                        </div>
                        <p className='text-xs font-medium text-foreground'>
                          Upload
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id={`slide-upload-${i}`}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => handleSlideImageUpload(i, e)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button className='' type='button' variant='outline' onClick={addSlide}>
          <Plus className='h-4 w-4 mr-2' /> Add Slide
        </Button>
      </div>
    </div>
  );
};
