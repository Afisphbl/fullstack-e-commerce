import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useTranslation } from "react-i18next";

import { useSiteSettings, SiteSettings } from "@/contexts/SiteSettingsContext";
import { SettingsSection } from "@/lib/api/settings";
import { SectionCard } from "@/components/admin/settings/SectionCard";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { HeroSettings } from "@/components/admin/settings/HeroSettings";
import { AboutSettings } from "@/components/admin/settings/AboutSettings";
import { ContactSettings } from "@/components/admin/settings/ContactSettings";
import { SocialSettings } from "@/components/admin/settings/SocialSettings";
import { CommerceSettings } from "@/components/admin/settings/CommerceSettings";
import { PreferencesSettings } from "@/components/admin/settings/PreferencesSettings";

const AdminSettingsPage = () => {
  const { t } = useTranslation("admin");

  const tabs = [
    { value: "general", label: t("general"), icon: Building2 },
    { value: "hero", label: t("hero"), icon: ImageIcon },
    { value: "about", label: t("about"), icon: Info },
    { value: "contact", label: t("contactMap"), icon: Phone },
    { value: "social", label: t("social"), icon: Share2 },
    { value: "commerce", label: t("commerce"), icon: ShoppingBag },
    { value: "preferences", label: t("preferences"), icon: SettingsIcon },
  ];

  const { settings, save, reset } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const update = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await save(draft);
      toast({
        title: t("allSettingsSaved"),
        description: t("changesAreLive"),
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("errorSavingSettings"),
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSection = async () => {
    setIsSaving(true);
    try {
      await save(draft, activeTab as SettingsSection);
      toast({
        title: t("allSettingsSaved"),
        description: t("changesAreLive"),
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("errorSavingSettings"),
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsSaving(true);
    reset();
    toast({ title: t("reset") });
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <form onSubmit={handleSaveAll}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("storefrontSettings")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("manageSettingsDescription")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> {t("reset")}
          </Button>
          <Button
            type="button"
            onClick={handleSaveSection}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <Save className="h-4 w-4 mr-2" />{" "}
            {isSaving ? t("saving") : t("saveSection")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tabs */}
        <TabsList className="mb-6 hidden md:flex flex-wrap h-auto bg-card border border-border p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Mobile Dropdown */}
        <div className="mb-6 md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue>
                {(() => {
                  const currentTab = tabs.find((t) => t.value === activeTab);
                  const Icon = currentTab?.icon || Building2;
                  return (
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{currentTab?.label || t("general")}</span>
                    </div>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="general" className="space-y-6">
          <SectionCard title={t("brandIdentity")} icon={Building2}>
            <GeneralSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <SectionCard title={t("heroSection")} icon={ImageIcon}>
            <HeroSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <SectionCard title={t("aboutPage")} icon={Info}>
            <AboutSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <SectionCard title={t("contactLocation")} icon={Phone}>
            <ContactSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SectionCard title={t("socialMedia")} icon={Share2}>
            <SocialSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="commerce" className="space-y-6">
          <SectionCard title={t("commerce")} icon={ShoppingBag}>
            <CommerceSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <SectionCard title={t("preferences")} icon={SettingsIcon}>
            <PreferencesSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
        >
          <Save className="h-4 w-4 mr-2" />{" "}
          {isSaving ? t("saving") : t("saveAllChanges")}
        </Button>
      </div>
    </form>
  );
};

export default AdminSettingsPage;
