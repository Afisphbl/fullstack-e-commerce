import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Save,
  Building2,
  Image as ImageIcon,
  Info,
  Phone,
  Share2,
  ShoppingBag,
  Settings as SettingsIcon,
  RotateCcw,
} from "lucide-react";

import { useSiteSettings, SiteSettings } from "@/contexts/SiteSettingsContext";
import { SectionCard } from "@/components/admin/settings/SectionCard";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { HeroSettings } from "@/components/admin/settings/HeroSettings";
import { AboutSettings } from "@/components/admin/settings/AboutSettings";
import { ContactSettings } from "@/components/admin/settings/ContactSettings";
import { SocialSettings } from "@/components/admin/settings/SocialSettings";
import { CommerceSettings } from "@/components/admin/settings/CommerceSettings";
import { PreferencesSettings } from "@/components/admin/settings/PreferencesSettings";

const AdminSettingsPage = () => {
  const { settings, save, reset } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  const update = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save(draft);
    toast({
      title: "Settings saved",
      description: "Changes are live across the site.",
    });
  };

  const handleReset = () => {
    reset();
    toast({ title: "Reset to defaults" });
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Storefront Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage everything customers see — hero, about, contact, social and
            commerce.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto bg-card border border-border p-1">
          <TabsTrigger value="general">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="hero">
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="h-3.5 w-3.5 mr-1.5" />
            About
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Contact & Map
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Social
          </TabsTrigger>
          <TabsTrigger value="commerce">
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Commerce
          </TabsTrigger>
          <TabsTrigger value="prefs">
            <SettingsIcon className="h-3.5 w-3.5 mr-1.5" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SectionCard title="Brand Identity" icon={Building2}>
            <GeneralSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <SectionCard title="Hero Section" icon={ImageIcon}>
            <HeroSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <SectionCard title="About Page" icon={Info}>
            <AboutSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <SectionCard title="Contact & Location" icon={Phone}>
            <ContactSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SectionCard title="Social Media" icon={Share2}>
            <SocialSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="commerce" className="space-y-6">
          <SectionCard title="Commerce" icon={ShoppingBag}>
            <CommerceSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="prefs" className="space-y-6">
          <SectionCard title="Preferences" icon={SettingsIcon}>
            <PreferencesSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
        >
          <Save className="h-4 w-4 mr-2" /> Save All Changes
        </Button>
      </div>
    </form>
  );
};

export default AdminSettingsPage;
