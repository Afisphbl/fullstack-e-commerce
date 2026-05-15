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
import { UploadResponse } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface AboutSettingsProps {
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
            rows={4}
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
            rows={4}
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
            rows={4}
          />
        </div>
      </div>
    </Field>
  );
};

// Helper for multilingual stat/value fields
const MultilingualInlineInput = ({
  value,
  onChange,
  placeholder,
}: {
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
  );
};

export const AboutSettings = ({ draft, update }: AboutSettingsProps) => {
  const { t } = useTranslation("admin");
  const [aboutImagePreview, setAboutImagePreview] = useState<string>(
    draft.aboutImage
  );
  const aboutImageInputRef = useRef<HTMLInputElement>(null);

  const handleAboutImageUpload = async (
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
          const result = response.url;
          setAboutImagePreview(result);
          update("aboutImage", result);
          toast.success(t("imageUploaded"), { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || t("uploadError"), { id: toastId });
      }
    }
  };

  const updateStat = (idx: number, patch: Partial<AboutStat>) => {
    const next = [...draft.aboutStats];
    next[idx] = { ...next[idx], ...patch } as AboutStat;
    update("aboutStats", next);
  };

  const addStat = () =>
    update("aboutStats", [
      ...draft.aboutStats,
      {
        value: "0",
        label: { am: "አዲስ ስታቲስቲክስ", en: "New Stat", om: "Stat Haaraa" },
      },
    ]);

  const removeStat = (idx: number) =>
    update(
      "aboutStats",
      draft.aboutStats.filter((_, i) => i !== idx)
    );

  const updateValue = (idx: number, patch: Partial<AboutValue>) => {
    const next = [...draft.aboutValues];
    next[idx] = { ...next[idx], ...patch } as AboutValue;
    update("aboutValues", next);
  };

  const addValue = () =>
    update("aboutValues", [
      ...draft.aboutValues,
      {
        title: { am: "አዲስ እሴት", en: "New Value", om: "Gatii Haaraa" },
        desc: { am: "", en: "", om: "" },
      },
    ]);

  const removeValue = (idx: number) =>
    update(
      "aboutValues",
      draft.aboutValues.filter((_, i) => i !== idx)
    );

  return (
    <div className="space-y-6">
      {/* About Header */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("aboutPageHeader")}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MultilingualField
            label={t("eyebrow")}
            value={draft.aboutEyebrow}
            onChange={(val) => update("aboutEyebrow", val)}
          />
          <MultilingualField
            label={t("titleStart")}
            value={draft.aboutTitle}
            onChange={(val) => update("aboutTitle", val)}
          />
          <MultilingualField
            label={t("highlightedWord")}
            value={draft.aboutHighlight}
            onChange={(val) => update("aboutHighlight", val)}
          />
        </div>
        <Field label={t("heroImage")}>
          <div className="space-y-3">
            <div
              className="relative group aspect-video max-w-2xl rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => aboutImageInputRef.current?.click()}
            >
              {aboutImagePreview ? (
                <>
                  <img
                    src={aboutImagePreview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium">
                      {t("changeImage")}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("removeAboutImage")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAboutImagePreview("");
                      update("aboutImage", "");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-full bg-background shadow-sm border border-border mb-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t("clickToUploadHeroImage")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("uploadAboutImageHint")}
                  </p>
                </>
              )}
            </div>
            <Input
              ref={aboutImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAboutImageUpload}
            />
          </div>
        </Field>
        <MultilingualTextareaField
          label={t("introParagraph")}
          value={draft.aboutIntro}
          onChange={(val) => update("aboutIntro", val)}
        />
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("stats")}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {draft.aboutStats.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="mb-2 flex justify-between items-center">
                <Label className="text-xs uppercase">
                  {t("statNumber", { number: i + 1 })}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStat(i)}
                  className="text-destructive h-7 hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("value")}
                  </Label>
                  <Input
                    value={s.value}
                    onChange={(e) => updateStat(i, { value: e.target.value })}
                    placeholder="e.g., 1000+"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("labelMultilingual")}
                  </Label>
                  <MultilingualInlineInput
                    value={s.label}
                    onChange={(val) => updateStat(i, { label: val })}
                    placeholder={t("label")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addStat}
          className="rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" /> {t("addStat")}
        </Button>
      </div>

      {/* Core Values */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("coreValues")}
        </h3>
        <div className="space-y-3">
          {draft.aboutValues.map((v, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="mb-3 flex justify-between items-center">
                <Label className="text-sm font-semibold uppercase">
                  {t("valueNumber", { number: i + 1 })}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeValue(i)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("titleMultilingual")}
                  </Label>
                  <MultilingualInlineInput
                    value={v.title}
                    onChange={(val) => updateValue(i, { title: val })}
                    placeholder={t("title")}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("descriptionMultilingual")}
                  </Label>
                  <MultilingualInlineInput
                    value={v.desc}
                    onChange={(val) => updateValue(i, { desc: val })}
                    placeholder={t("description")}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addValue}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" /> {t("addValue")}
          </Button>
        </div>
      </div>
    </div>
  );
};
