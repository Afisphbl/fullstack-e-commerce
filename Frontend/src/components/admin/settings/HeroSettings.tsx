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
import { useTranslation } from "react-i18next";

interface HeroSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
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
  const { t } = useTranslation("admin");
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("amharic")}
          </label>
          <Input
            value={multiValue.am}
            onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
            className="bg-background font-sans"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("english")}
          </label>
          <Input
            value={multiValue.en}
            onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
            className="bg-background"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("afaanOromo")}
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
  const { t } = useTranslation("admin");
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("amharic")}
          </label>
          <Textarea
            value={multiValue.am}
            onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
            className="bg-background font-sans resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("english")}
          </label>
          <Textarea
            value={multiValue.en}
            onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
            className="bg-background resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-normal block mb-1.5">
            {t("afaanOromo")}
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
  const { t } = useTranslation("admin");
  const multiValue =
    typeof value === "string"
      ? { am: value, en: value, om: value }
      : value || { am: "", en: "", om: "" };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
        <Input
          placeholder={`${placeholder} (${t("amharic")})`}
          value={multiValue.am}
          onChange={(e) => onChange({ ...multiValue, am: e.target.value })}
          className="text-sm font-sans"
        />
        <Input
          placeholder={`${placeholder} (${t("english")})`}
          value={multiValue.en}
          onChange={(e) => onChange({ ...multiValue, en: e.target.value })}
          className="text-sm"
        />
        <Input
          placeholder={`${placeholder} (${t("afaanOromo")})`}
          value={multiValue.om}
          onChange={(e) => onChange({ ...multiValue, om: e.target.value })}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export const HeroSettings = ({ draft, update }: HeroSettingsProps) => {
  const { t } = useTranslation("admin");

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const next = [...draft.heroSlides];
    next[idx] = { ...next[idx], ...patch } as HeroSlide;
    update("heroSlides", next);
  };

  const addSlide = () =>
    update("heroSlides", [
      ...draft.heroSlides,
      {
        image: "",
        title: { am: "አዲስ ስላይድ", en: "New Slide", om: "Slide Haaraa" },
        subtitle: { am: "", en: "", om: "" },
      },
    ]);

  const removeSlide = (idx: number) =>
    update(
      "heroSlides",
      draft.heroSlides.filter((_, i) => i !== idx)
    );

  const handleSlideImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const toastId = toast.loading(t("uploadingImage"));
      try {
        const response = await apiFetch<UploadResponse>("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status === "success") {
          updateSlide(idx, { image: response.url });
          toast.success(t("imageUploaded"), { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || t("uploadError"), { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("homepageHeroContent")}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MultilingualField
            label={t("heroEyebrow")}
            value={draft.heroEyebrow}
            onChange={(val) => update("heroEyebrow", val)}
          />
          <MultilingualField
            label={t("heroCtaText")}
            value={draft.heroCtaText}
            onChange={(val) => update("heroCtaText", val)}
          />
          <MultilingualField
            label={t("heroTitleStart")}
            value={draft.heroTitle}
            onChange={(val) => update("heroTitle", val)}
          />
          <MultilingualField
            label={t("heroHighlight")}
            hint={t("heroHighlightHint")}
            value={draft.heroHighlight}
            onChange={(val) => update("heroHighlight", val)}
          />
          <Field label={t("heroCtaLink")}>
            <Input
              value={draft.heroCtaLink}
              onChange={(e) => update("heroCtaLink", e.target.value)}
              placeholder="/shop"
              className="bg-background"
            />
          </Field>
        </div>
        <MultilingualTextareaField
          label={t("heroSubtitle")}
          value={draft.heroSubtitle}
          onChange={(val) => update("heroSubtitle", val)}
        />
      </div>

      {/* Hero Slideshow */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("heroSlideshow")}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {draft.heroSlides.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("slideNumber", { number: i + 1 })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlide(i)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Multilingual Text Fields */}
                <div className="space-y-3">
                  <MultilingualSlideInput
                    label={t("title")}
                    value={s.title}
                    onChange={(val) => updateSlide(i, { title: val })}
                    placeholder={t("slideTitlePlaceholder")}
                  />
                  <MultilingualSlideInput
                    label={t("subtitle")}
                    value={s.subtitle}
                    onChange={(val) => updateSlide(i, { subtitle: val })}
                    placeholder={t("slideSubtitlePlaceholder")}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    {t("slideImage")}
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
                          <p className="text-white text-xs font-medium">
                            {t("change")}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={t("removeSlideImage")}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSlide(i, { image: "" });
                          }}
                          className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-background shadow-sm border border-border mb-1">
                          <Upload className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {t("upload")}
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
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addSlide}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" /> {t("addSlide")}
          </Button>
        </div>
      </div>
    </div>
  );
};
