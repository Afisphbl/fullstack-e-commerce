import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SiteSettings } from "@/contexts/SiteSettingsContext";
import { Field } from "./Field";

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
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
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
          title: "Location detected",
          description: `Coordinates: ${lat}, ${lng}`,
        });
        setGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: error.message || "Please allow location access.",
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
        title: "Address required",
        description: "Enter an address first.",
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
          title: "Coordinates filled",
          description: data[0].display_name,
        });
      } else {
        toast({
          title: "No results",
          description: "Try a more specific address.",
        });
      }
    } catch {
      toast({ title: "Lookup failed", description: "Check your connection." });
    } finally {
      setGeocoding(false);
    }
  };

  const mapPreview = `https://www.google.com/maps?q=${draft.mapLat},${draft.mapLng}&output=embed`;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Email">
            <Input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="bg-background"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={draft.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className="bg-background"
            />
          </Field>
        </div>
        <Field label="Address">
          <Input
            value={draft.contactAddress}
            onChange={(e) => update("contactAddress", e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>

      {/* Working Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Working Hours</h3>
        <div className="space-y-3">
          {workingHours.map((day, index) => (
            <div
              key={day.day}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border rounded-lg"
            >
              <div className="w-full sm:w-32 font-medium">{day.day}</div>
              <Input
                value={day.hours}
                onChange={(e) =>
                  handleWorkingHoursChange(index, "hours", e.target.value)
                }
                className="flex-1 w-full"
                disabled={!day.isOpen}
                placeholder="9:00 AM - 5:00 PM"
              />
              <div className="flex items-center gap-2 self-start sm:self-auto mt-2 sm:mt-0">
                <Label htmlFor={`open-${index}`} className="text-sm">
                  Open
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
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Map Location
        </h3>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-end gap-3">
          <div className="w-full sm:flex-1 sm:min-w-[140px]">
            <Label>Latitude</Label>
            <Input
              value={draft.mapLat}
              onChange={(e) => update("mapLat", e.target.value)}
              placeholder="9.0320"
              className="bg-background mt-1"
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[140px]">
            <Label>Longitude</Label>
            <Input
              value={draft.mapLng}
              onChange={(e) => update("mapLng", e.target.value)}
              placeholder="38.7469"
              className="bg-background mt-1"
            />
          </div>
          <div className="w-full sm:w-24">
            <Label>Zoom</Label>
            <Input
              value={draft.mapZoom}
              onChange={(e) => update("mapZoom", e.target.value)}
              className="bg-background mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {gettingLocation ? "Getting..." : "Use My Location"}
            </Button>
            <Button
              type="button"
              onClick={findCoordsFromAddress}
              disabled={geocoding}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              {geocoding ? "Searching..." : "From Address"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Click "Use My Location" to auto-fill with your current coordinates, or
          "From Address" to geocode from the address above.
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            title="Map preview"
            src={mapPreview}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
