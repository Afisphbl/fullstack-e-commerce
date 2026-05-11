import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SiteSettings } from "@/contexts/SiteSettingsContext";

interface PreferencesSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const PreferencesSettings = ({ draft, update }: PreferencesSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">System Preferences</h3>
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <div>
          <Label className="text-foreground">Maintenance Mode</Label>
          <p className="text-xs text-muted-foreground">
            Disable storefront temporarily.
          </p>
        </div>
        <Switch
          checked={draft.maintenanceMode}
          onCheckedChange={(v) => update("maintenanceMode", v)}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <div>
          <Label className="text-foreground">Email Notifications</Label>
          <p className="text-xs text-muted-foreground">
            Get notified about new orders.
          </p>
        </div>
        <Switch
          checked={draft.emailNotifications}
          onCheckedChange={(v) => update("emailNotifications", v)}
        />
      </div>
    </div>
  );
};
