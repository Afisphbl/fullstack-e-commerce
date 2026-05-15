import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { useTranslation } from "react-i18next";

interface CommerceSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => void;
}

export const CommerceSettings = ({ draft, update }: CommerceSettingsProps) => {
  const { t } = useTranslation("admin");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        {t("commerceSettings")}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label={t("taxRatePercent")}>
          <Input
            value={draft.taxRate}
            onChange={(e) => update("taxRate", e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field label={t("freeShippingMin")}>
          <Input
            value={draft.freeShippingMin}
            onChange={(e) => update("freeShippingMin", e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field label={t("currency")}>
          <Select
            value={draft.currency}
            onValueChange={(value) => update("currency", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={t("selectCurrency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETB">ETB - {t("currencyETB")}</SelectItem>
              <SelectItem value="USD">USD - {t("currencyUSD")}</SelectItem>
              <SelectItem value="EUR">EUR - {t("currencyEUR")}</SelectItem>
              <SelectItem value="GBP">GBP - {t("currencyGBP")}</SelectItem>
              <SelectItem value="KES">KES - {t("currencyKES")}</SelectItem>
              <SelectItem value="TZS">TZS - {t("currencyTZS")}</SelectItem>
              <SelectItem value="UGX">UGX - {t("currencyUGX")}</SelectItem>
              <SelectItem value="ZAR">ZAR - {t("currencyZAR")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
};
