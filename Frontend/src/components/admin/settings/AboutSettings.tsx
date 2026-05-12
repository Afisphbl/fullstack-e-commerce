import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, X } from "lucide-react";
import {
  SiteSettings,
  AboutStat,
  AboutValue,
} from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

interface AboutSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => void;
}

export const AboutSettings = ({ draft, update }: AboutSettingsProps) => {
  const [aboutImagePreview, setAboutImagePreview] = useState<string>(
    draft.aboutImage,
  );
  const aboutImageInputRef = useRef<HTMLInputElement>(null);

  const handleAboutImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const toastId = toast.loading("Uploading image...");
      try {
        const response = await apiFetch("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status === "success") {
          const result = response.url;
          setAboutImagePreview(result);
          update("aboutImage", result);
          toast.success("Image uploaded successfully!", { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Failed to upload image", { id: toastId });
      }
    }
  };

  const updateStat = (idx: number, patch: Partial<AboutStat>) => {
    const next = [...draft.aboutStats];
    next[idx] = { ...next[idx], ...patch };
    update("aboutStats", next);
  };

  const addStat = () =>
    update("aboutStats", [
      ...draft.aboutStats,
      { value: "0", label: "New Stat" },
    ]);

  const removeStat = (idx: number) =>
    update(
      "aboutStats",
      draft.aboutStats.filter((_, i) => i !== idx),
    );

  const updateValue = (idx: number, patch: Partial<AboutValue>) => {
    const next = [...draft.aboutValues];
    next[idx] = { ...next[idx], ...patch };
    update("aboutValues", next);
  };

  const addValue = () =>
    update("aboutValues", [
      ...draft.aboutValues,
      { title: "New Value", desc: "" },
    ]);

  const removeValue = (idx: number) =>
    update(
      "aboutValues",
      draft.aboutValues.filter((_, i) => i !== idx),
    );

  return (
    <div className='space-y-6'>
      {/* About Header */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>About Page Header</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Field label='Eyebrow'>
            <Input
              value={draft.aboutEyebrow}
              onChange={(e) => update("aboutEyebrow", e.target.value)}
              className='bg-background'
            />
          </Field>
          <Field label='Title (start)'>
            <Input
              value={draft.aboutTitle}
              onChange={(e) => update("aboutTitle", e.target.value)}
              className='bg-background'
            />
          </Field>
          <Field label='Highlighted Word'>
            <Input
              value={draft.aboutHighlight}
              onChange={(e) => update("aboutHighlight", e.target.value)}
              className='bg-background'
            />
          </Field>
        </div>
        <Field label='Hero Image'>
          <div className='space-y-3'>
            <div
              className='relative group aspect-video max-w-2xl rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer'
              onClick={() => aboutImageInputRef.current?.click()}
            >
              {aboutImagePreview ? (
                <>
                  <img
                    src={aboutImagePreview}
                    alt='About hero preview'
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <p className='text-white text-sm font-medium'>
                      Change Image
                    </p>
                  </div>
                  <button
                    type='button'
                    aria-label='Remove about image'
                    onClick={(e) => {
                      e.stopPropagation();
                      setAboutImagePreview("");
                      update("aboutImage", "");
                    }}
                    className='absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </>
              ) : (
                <>
                  <div className='p-3 rounded-full bg-background shadow-sm border border-border mb-2'>
                    <Upload className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <p className='text-sm font-medium text-foreground'>
                    Click to upload hero image
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    JPG, PNG or WebP (recommended: 1200x600)
                  </p>
                </>
              )}
            </div>
            <Input
              ref={aboutImageInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleAboutImageUpload}
            />
          </div>
        </Field>
        <Field label='Intro Paragraph'>
          <Textarea
            value={draft.aboutIntro}
            onChange={(e) => update("aboutIntro", e.target.value)}
            rows={4}
            className='bg-background'
          />
        </Field>
      </div>

      {/* Stats */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Stats</h3>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {draft.aboutStats.map((s, i) => (
            <div
              key={i}
              className='flex items-end gap-2 rounded-lg border border-border bg-background p-3'
            >
              <div className='flex-1'>
                <Label className='text-xs'>Value</Label>
                <Input
                  value={s.value}
                  onChange={(e) => updateStat(i, { value: e.target.value })}
                />
              </div>
              <div className='flex-1'>
                <Label className='text-xs'>Label</Label>
                <Input
                  value={s.label}
                  onChange={(e) => updateStat(i, { label: e.target.value })}
                />
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeStat(i)}
                className='text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
        <Button type='button' variant='outline' onClick={addStat}>
          <Plus className='h-4 w-4 mr-2' /> Add Stat
        </Button>
      </div>

      {/* Core Values */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Core Values</h3>
        <div className='space-y-3'>
          {draft.aboutValues.map((v, i) => (
            <div
              key={i}
              className='rounded-lg border border-border bg-background p-3'
            >
              <div className='mb-2 flex justify-end'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeValue(i)}
                  className='text-destructive'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                <Input
                  placeholder='Title'
                  value={v.title}
                  onChange={(e) => updateValue(i, { title: e.target.value })}
                />
                <div className='md:col-span-2'>
                  <Input
                    placeholder='Description'
                    value={v.desc}
                    onChange={(e) => updateValue(i, { desc: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type='button' variant='outline' onClick={addValue}>
            <Plus className='h-4 w-4 mr-2' /> Add Value
          </Button>
        </div>
      </div>
    </div>
  );
};
