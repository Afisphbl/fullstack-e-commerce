import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { useTranslation } from "react-i18next";

interface PreferencesSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => void;
}

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "am", label: "አማርኛ (Amharic)" },
  { id: "om", label: "Afaan Oromo" },
];

export const PreferencesSettings = ({
  draft,
  update,
}: PreferencesSettingsProps) => {
  const { t } = useTranslation("admin");

  const toggleLanguage = (langId: string) => {
    const current = draft.supportedLanguages || ["en", "am", "om"];
    if (current.includes(langId)) {
      if (current.length > 1) {
        update(
          "supportedLanguages",
          current.filter((id) => id !== langId)
        );
      }
    } else {
      update("supportedLanguages", [...current, langId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("systemPreferences")}
        </h3>
        <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
          <div>
            <Label className="text-foreground">{t("maintenanceMode")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("maintenanceModeHint")}
            </p>
          </div>
          <Switch
            checked={draft.maintenanceMode}
            onCheckedChange={(v) => update("maintenanceMode", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
          <div>
            <Label className="text-foreground">{t("emailNotifications")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("emailNotificationsHint")}
            </p>
          </div>
          <Switch
            checked={draft.emailNotifications}
            onCheckedChange={(v) => update("emailNotifications", v)}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("languageSettings")}
        </h3>
        <Field
          label={t("supportedLanguages")}
          hint={t("supportedLanguagesHint")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.id}
                className="flex items-center space-x-2 rounded-lg border border-border bg-background p-3"
              >
                <Checkbox
                  id={`lang-${lang.id}`}
                  checked={(draft.supportedLanguages || []).includes(lang.id)}
                  onCheckedChange={() => toggleLanguage(lang.id)}
                />
                <label
                  htmlFor={`lang-${lang.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {lang.label}
                </label>
              </div>
            ))}
          </div>
        </Field>
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("locationSettings")}
        </h3>
        <div className="grid gap-6">
          <Field
            label={t("enableLocationRestrictions")}
            hint={t("locationRestrictionsHint")}
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
              label={t("allowedDeliveryCities")}
              hint={t("allowedCitiesHint")}
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
                placeholder={t("citiesPlaceholder")}
              />
            </Field>
          )}
        </div>
      </div>
    </div>
  );
};
