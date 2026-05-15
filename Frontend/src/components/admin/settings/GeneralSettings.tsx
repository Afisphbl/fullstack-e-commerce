import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { UploadResponse } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface GeneralSettingsProps {
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
  // Convert legacy string to multilingual object
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

// Helper component for multilingual textarea
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
  // Convert legacy string to multilingual object
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

export const GeneralSettings = ({ draft, update }: GeneralSettingsProps) => {
  const { t } = useTranslation("admin");
  const [logoPreview, setLogoPreview] = useState<string>(draft.logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      setIsUploading(true);
      const toastId = toast.loading(t("uploadingLogo"));
      try {
        const response = await apiFetch<UploadResponse>("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status === "success") {
          const result = response.url;
          setLogoPreview(result);
          update("logoUrl", result);
          toast.success(t("logoUploaded"), { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || t("uploadError"), { id: toastId });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MultilingualField
          label={t("companyName")}
          value={draft.companyName}
          onChange={(val) => update("companyName", val)}
        />
        <MultilingualField
          label={t("tagline")}
          value={draft.tagline}
          onChange={(val) => update("tagline", val)}
        />
      </div>
      <Field label={t("logo")} hint={t("logoHint")}>
        <div className="space-y-3">
          <div
            className="relative group aspect-[3/1] max-w-sm rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => !isUploading && logoInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">
                  {t("uploading")}
                </p>
              </div>
            ) : logoPreview ? (
              <>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-4"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">
                    {t("changeLogo")}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t("removeLogo")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoPreview("");
                    update("logoUrl", "");
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
                  {t("clickToUploadLogo")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("uploadLogoFormatHint")}
                </p>
              </>
            )}
          </div>
          <Input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={isUploading}
          />
        </div>
      </Field>
      <MultilingualTextareaField
        label={t("shortDescription")}
        value={draft.description}
        onChange={(val) => update("description", val)}
      />
    </div>
  );
};
