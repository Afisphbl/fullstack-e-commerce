import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";

interface GeneralSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const GeneralSettings = ({ draft, update }: GeneralSettingsProps) => {
  const [logoPreview, setLogoPreview] = useState<string>(draft.logoUrl);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        update("logoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Company Name">
          <Input
            value={draft.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field label="Tagline">
          <Input
            value={draft.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>
      <Field label="Logo" hint="Upload your company logo (optional).">
        <div className="space-y-3">
          <div
            className="relative group aspect-[3/1] max-w-md rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              <>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-4"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Change Logo</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove logo"
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
                  Click to upload logo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG or SVG (recommended: transparent background)
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
          />
        </div>
      </Field>
      <Field label="Short Description">
        <Textarea
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          className="bg-background"
        />
      </Field>
    </div>
  );
};
