import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["admin"]);
  const { settings, save, reset } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { value: "general", label: t("admin:settings.general"), icon: Building2 },
    { value: "hero", label: t("admin:settings.hero"), icon: ImageIcon },
    { value: "about", label: t("admin:settings.about"), icon: Info },
    { value: "contact", label: t("admin:settings.contact"), icon: Phone },
    { value: "social", label: t("admin:settings.social"), icon: Share2 },
    {
      value: "commerce",
      label: t("admin:settings.commerce"),
      icon: ShoppingBag,
    },
    {
      value: "preferences",
      label: t("admin:settings.preferences"),
      icon: SettingsIcon,
    },
  ];

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
        title: t("admin:settings.saveSuccess"),
        description: t("admin:settings.saveDescription"),
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("admin:settings.saveError"),
        description: err.message || "",
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
        title: t("admin:settings.saveSectionSuccess"),
        description: t("admin:settings.saveDescription"),
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("admin:settings.saveError"),
        description: err.message || "",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsSaving(true);
    reset();
    toast({ title: t("admin:settings.resetSuccess") });
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <form onSubmit={handleSaveAll}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("admin:settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin:settings.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> {t("admin:settings.reset")}
          </Button>
          <Button
            type="button"
            onClick={handleSaveSection}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
          >
            <Save className="h-4 w-4 mr-2" />{" "}
            {isSaving
              ? t("admin:settings.saving")
              : t("admin:settings.saveSection")}
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
                      <span>
                        {currentTab?.label || t("admin:settings.general")}
                      </span>
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
          <SectionCard
            title={t("admin:settings.brandIdentity")}
            icon={Building2}
          >
            <GeneralSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <SectionCard title={t("admin:settings.heroSection")} icon={ImageIcon}>
            <HeroSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <SectionCard title={t("admin:settings.aboutPage")} icon={Info}>
            <AboutSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <SectionCard title={t("admin:settings.contactLocation")} icon={Phone}>
            <ContactSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SectionCard title={t("admin:settings.socialMedia")} icon={Share2}>
            <SocialSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="commerce" className="space-y-6">
          <SectionCard title={t("admin:settings.commerce")} icon={ShoppingBag}>
            <CommerceSettings draft={draft} update={update} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="prefs" className="space-y-6">
          <SectionCard
            title={t("admin:settings.preferences")}
            icon={SettingsIcon}
          >
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
          {isSaving ? t("admin:settings.saving") : t("admin:settings.saveAll")}
        </Button>
      </div>
    </form>
  );
};

export default AdminSettingsPage;
