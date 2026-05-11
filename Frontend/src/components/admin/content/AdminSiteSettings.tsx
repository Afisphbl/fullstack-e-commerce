import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings, updateSiteSettings, uploadLogo, uploadFavicon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminSiteSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
  });

  const [formData, setFormData] = useState({
    siteName: "",
    tagline: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    mapCoordinates: { lat: 0, lng: 0 },
    footerText: "",
    copyrightText: "",
    workingHours: DAYS_OF_WEEK.map((day) => ({
      day,
      hours: "9:00 AM - 5:00 PM",
      isOpen: true,
    })),
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        tagline: settings.tagline || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
        mapCoordinates: settings.mapCoordinates || { lat: 0, lng: 0 },
        footerText: settings.footerText || "",
        copyrightText: settings.copyrightText || "",
        workingHours: settings.workingHours || DAYS_OF_WEEK.map((day) => ({
          day,
          hours: "9:00 AM - 5:00 PM",
          isOpen: true,
        })),
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const logoMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      setLogoFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    },
  });

  const faviconMutation = useMutation({
    mutationFn: uploadFavicon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      toast({
        title: "Success",
        description: "Favicon uploaded successfully",
      });
      setFaviconFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload favicon",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload logo if changed
    if (logoFile) {
      await logoMutation.mutateAsync(logoFile);
    }

    // Upload favicon if changed
    if (faviconFile) {
      await faviconMutation.mutateAsync(faviconFile);
    }

    // Update settings
    updateMutation.mutate(formData);
  };

  const handleWorkingHoursChange = (index: number, field: string, value: any) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setFormData({ ...formData, workingHours: newWorkingHours });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Site Settings</h2>
        <p className="text-muted-foreground">
          Manage your website's general settings and information
        </p>
      </div>

      <Separator />

      {/* Branding */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) =>
                setFormData({ ...formData, siteName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Logo"
            value={settings?.logo}
            onChange={setLogoFile}
            description="Upload your site logo (PNG, JPG)"
          />
          <ImageUpload
            label="Favicon"
            value={settings?.favicon}
            onChange={setFaviconFile}
            description="Upload your favicon (ICO, PNG)"
          />
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone *</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
        </div>
      </div>

      <Separator />

      {/* Map Coordinates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Map Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={formData.mapCoordinates.lat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mapCoordinates: {
                    ...formData.mapCoordinates,
                    lat: parseFloat(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={formData.mapCoordinates.lng}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mapCoordinates: {
                    ...formData.mapCoordinates,
                    lng: parseFloat(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Working Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Working Hours</h3>
        <div className="space-y-3">
          {formData.workingHours.map((day, index) => (
            <div
              key={day.day}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              <div className="w-32 font-medium">{day.day}</div>
              <Input
                value={day.hours}
                onChange={(e) =>
                  handleWorkingHoursChange(index, "hours", e.target.value)
                }
                className="flex-1"
                disabled={!day.isOpen}
              />
              <div className="flex items-center gap-2">
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

      <Separator />

      {/* Footer */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Footer</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={formData.footerText}
              onChange={(e) =>
                setFormData({ ...formData, footerText: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text *</Label>
            <Input
              id="copyrightText"
              value={formData.copyrightText}
              onChange={(e) =>
                setFormData({ ...formData, copyrightText: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateMutation.isPending || logoMutation.isPending || faviconMutation.isPending}
          className="gap-2"
        >
          {(updateMutation.isPending || logoMutation.isPending || faviconMutation.isPending) ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
