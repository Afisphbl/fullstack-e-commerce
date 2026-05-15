import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";
import { useTranslation } from "react-i18next";

interface WorkingHour {
  day: string;
  hours: string;
  isOpen: boolean;
}

interface ContactSettingsProps {
  draft: SiteSettings;
  update: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => void;
}

export const ContactSettings = ({ draft, update }: ContactSettingsProps) => {
  const { t } = useTranslation("admin");
  const [geocoding, setGeocoding] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Parse working hours from string to structured format
  const parseWorkingHours = (hoursString: string): WorkingHour[] => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const lines = hoursString.split("\n").filter(Boolean);

    return days.map((day) => {
      const line = lines.find((l) =>
        l.toLowerCase().includes(day.toLowerCase())
      );
      if (line) {
        const match = line.match(/:\s*(.+)/);
        const hours = match && match[1] ? match[1].trim() : "9:00 AM - 5:00 PM";
        return { day, hours, isOpen: !hours.toLowerCase().includes("closed") };
      }
      return { day, hours: "9:00 AM - 5:00 PM", isOpen: true };
    });
  };

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(
    parseWorkingHours(draft.workingHours)
  );

  const handleWorkingHoursChange = (
    index: number,
    field: keyof WorkingHour,
    value: string | boolean
  ) => {
    const updated = [...workingHours];
    updated[index] = Object.assign({}, updated[index], { [field]: value });
    setWorkingHours(updated);

    // Convert back to string format
    const hoursString = updated
      .map((wh) => `${wh.day}: ${wh.isOpen ? wh.hours : "Closed"}`)
      .join("\n");
    update("workingHours", hoursString);
  };

  // Get admin's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("geolocationNotSupported"),
        description: t("geolocationNotSupportedDesc"),
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        update("mapLat", lat);
        update("mapLng", lng);
        toast({
          title: t("locationDetected"),
          description: `${t("coordinates")}: ${lat}, ${lng}`,
        });
        setGettingLocation(false);
      },
      (error) => {
        toast({
          title: t("locationAccessDenied"),
          description: error.message || t("allowLocationAccess"),
          variant: "destructive",
        });
        setGettingLocation(false);
      }
    );
  };

  // Geocode from address
  const findCoordsFromAddress = async () => {
    if (!draft.contactAddress.trim()) {
      toast({
        title: t("addressRequired"),
        description: t("enterAddressFirst"),
      });
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          draft.contactAddress
        )}`
      );
      const data = await res.json();
      if (data?.[0]) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lng = parseFloat(data[0].lon).toFixed(6);
        update("mapLat", lat);
        update("mapLng", lng);
        toast({
          title: t("coordinatesFilled"),
          description: data[0].display_name,
        });
      } else {
        toast({
          title: t("noResults"),
          description: t("trySpecificAddress"),
        });
      }
    } catch {
      toast({ title: t("lookupFailed"), description: t("checkConnection") });
    } finally {
      setGeocoding(false);
    }
  };

  const mapPreview = `https://www.google.com/maps?q=${draft.mapLat},${draft.mapLng}&output=embed`;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("contactInformation")}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("email")}>
            <Input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label={t("phone")}>
            <Input
              value={draft.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className="bg-background"
            />
          </Field>
        </div>
        <Field label={t("address")}>
          <Input
            value={draft.contactAddress}
            onChange={(e) => update("contactAddress", e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>

      {/* Working Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("workingHours")}
        </h3>
        <div className="space-y-3">
          {workingHours.map((day, index) => (
            <div
              key={day.day}
              className="grid grid-cols-[1fr_auto] gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4 p-3 border border-border/50 rounded-xl"
            >
              <div className="font-medium self-center sm:w-32 uppercase tracking-wide text-xs text-muted-foreground">
                {t(`days.${day.day.toLowerCase()}`)}
              </div>
              <div className="flex items-center gap-2 justify-end sm:hidden">
                <Label
                  htmlFor={`open-mobile-${index}`}
                  className="text-sm font-normal"
                >
                  {t("open")}
                </Label>
                <Switch
                  id={`open-mobile-${index}`}
                  checked={day.isOpen}
                  onCheckedChange={(checked) =>
                    handleWorkingHoursChange(index, "isOpen", checked)
                  }
                />
              </div>
              <Input
                value={day.hours}
                onChange={(e) =>
                  handleWorkingHoursChange(index, "hours", e.target.value)
                }
                className="col-span-2 sm:col-span-1 flex-1 w-full rounded-lg h-9"
                disabled={!day.isOpen}
                placeholder="9:00 AM - 5:00 PM"
              />
              <div className="hidden sm:flex items-center gap-2">
                <Label
                  htmlFor={`open-${index}`}
                  className="text-sm font-normal"
                >
                  {t("open")}
                </Label>
                <Switch
                  id={`open-${index}`}
                  checked={day.isOpen}
                  onCheckedChange={(checked) =>
                    handleWorkingHoursChange(index, "isOpen", checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          {t("mapLocation")}
        </h3>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-end gap-3">
          <div className="w-full sm:flex-1 sm:min-w-[140px]">
            <Label className="text-xs uppercase text-muted-foreground">
              {t("latitude")}
            </Label>
            <Input
              value={draft.mapLat}
              onChange={(e) => update("mapLat", e.target.value)}
              placeholder="9.0320"
              className="bg-background mt-1.5 h-9"
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[140px]">
            <Label className="text-xs uppercase text-muted-foreground">
              {t("longitude")}
            </Label>
            <Input
              value={draft.mapLng}
              onChange={(e) => update("mapLng", e.target.value)}
              placeholder="38.7469"
              className="bg-background mt-1.5 h-9"
            />
          </div>
          <div className="w-full sm:w-24">
            <Label className="text-xs uppercase text-muted-foreground">
              {t("zoom")}
            </Label>
            <Input
              value={draft.mapZoom}
              onChange={(e) => update("mapZoom", e.target.value)}
              className="bg-background mt-1.5 h-9"
            />
          </div>
          <div className="grid grid-cols-1 sm:flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {gettingLocation ? t("getting") : t("useMyLocation")}
            </Button>
            <Button
              type="button"
              onClick={findCoordsFromAddress}
              disabled={geocoding}
              variant="outline"
              className="w-full sm:w-auto rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              {geocoding ? t("searching") : t("fromAddress")}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-light">
          {t("mapLocationHint")}
        </p>
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <iframe
            title="Map preview"
            src={mapPreview}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full grayscale contrast-[1.1]"
          />
        </div>
      </div>
    </div>
  );
};
