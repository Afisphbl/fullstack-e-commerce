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

interface CommerceSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const CommerceSettings = ({ draft, update }: CommerceSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Commerce Settings</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Tax Rate (%)">
          <Input
            value={draft.taxRate}
            onChange={(e) => update("taxRate", e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field label="Free Shipping Min">
          <Input
            value={draft.freeShippingMin}
            onChange={(e) => update("freeShippingMin", e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field label="Currency">
          <Select
            value={draft.currency}
            onValueChange={(value) => update("currency", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
              <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
              <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
              <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
};
