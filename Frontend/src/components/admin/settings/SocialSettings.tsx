import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { useTranslation } from "react-i18next";

interface SocialSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => void;
}

export const SocialSettings = ({ draft, update }: SocialSettingsProps) => {
  const { t } = useTranslation("admin");
  const [customSocialLinks, setCustomSocialLinks] = useState(
    draft.social.custom || []
  );

  // Keep local state in sync when draft updates (e.g. on reset)
  useEffect(() => {
    setCustomSocialLinks(draft.social.custom || []);
  }, [draft.social.custom]);

  const addCustomSocialLink = () => {
    const updated = [...customSocialLinks, { platform: "", url: "" }];
    setCustomSocialLinks(updated);
    update("social", { ...draft.social, custom: updated });
  };

  const updateCustomSocialLink = (
    idx: number,
    field: "platform" | "url",
    value: string
  ) => {
    const updated = [...customSocialLinks];
    updated[idx] = { ...updated[idx], [field]: value } as {
      platform: string;
      url: string;
    };
    setCustomSocialLinks(updated);
    update("social", { ...draft.social, custom: updated });
  };

  const removeCustomSocialLink = (idx: number) => {
    const updated = customSocialLinks.filter((_, i) => i !== idx);
    setCustomSocialLinks(updated);
    update("social", { ...draft.social, custom: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        {t("socialMediaLinks")}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(
          ["facebook", "instagram", "twitter", "linkedin", "youtube"] as const
        ).map((k) => (
          <Field key={k} label={t(`platforms.${k}`)}>
            <Input
              value={draft.social[k]}
              onChange={(e) =>
                update("social", { ...draft.social, [k]: e.target.value })
              }
              placeholder={`https://${k}.com/yourbrand`}
              className="bg-background"
            />
          </Field>
        ))}
      </div>

      {customSocialLinks.length > 0 && (
        <div className="mt-4 space-y-3">
          <Label className="text-sm font-semibold">
            {t("customSocialLinks")}
          </Label>
          {customSocialLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  placeholder={t("platformPlaceholder")}
                  value={link.platform}
                  onChange={(e) =>
                    updateCustomSocialLink(idx, "platform", e.target.value)
                  }
                  className="bg-background"
                />
              </div>
              <div className="flex-[2]">
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) =>
                    updateCustomSocialLink(idx, "url", e.target.value)
                  }
                  className="bg-background"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCustomSocialLink(idx)}
                className="text-destructive h-10 w-10 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addCustomSocialLink}
        className="mt-2 rounded-xl"
      >
        <Plus className="h-4 w-4 mr-2" /> {t("addAnotherSocialLink")}
      </Button>
    </div>
  );
};
