import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Loader2 } from "lucide-react";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { UploadResponse } from "@/lib/api";

interface GeneralSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => void;
}

export const GeneralSettings = ({ draft, update }: GeneralSettingsProps) => {
  const [logoPreview, setLogoPreview] = useState<string>(draft.logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      setIsUploading(true);
      const toastId = toast.loading("Uploading logo...");
      try {
        const response = await apiFetch<UploadResponse>("/api/v1/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status === "success") {
          const result = response.url;
          setLogoPreview(result);
          update("logoUrl", result);
          toast.success("Logo uploaded successfully!", { id: toastId });
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Failed to upload logo", { id: toastId });
      } finally {
        setIsUploading(false);
      }
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
            className="relative group aspect-[3/1] max-w-sm rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => !isUploading && logoInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Uploading...</p>
              </div>
            ) : logoPreview ? (
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
            disabled={isUploading}
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

      <div className="pt-4 border-t border-border mt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Location Settings
        </h3>
        <div className="grid gap-6">
          <Field
            label="Enable Location Restrictions"
            hint="If enabled, orders will only be accepted for the cities specified below."
          >
            <div className="flex items-center h-10">
              <Switch
                checked={draft.enableLocationRestriction}
                onCheckedChange={(checked) =>
                  update("enableLocationRestriction", checked)
                }
              />
            </div>
          </Field>

          {draft.enableLocationRestriction && (
            <Field
              label="Allowed Delivery Cities"
              hint="Comma separated list of cities where you deliver."
            >
              <Textarea
                value={(draft.allowedDeliveryCities || []).join(", ")}
                onChange={(e) => {
                  const val = e.target.value;
                  update(
                    "allowedDeliveryCities",
                    val
                      ? val
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean)
                      : []
                  );
                }}
                className="bg-background"
                placeholder="e.g. Addis Ababa, Dire Dawa"
              />
            </Field>
          )}
        </div>
      </div>
    </div>
  );
};
