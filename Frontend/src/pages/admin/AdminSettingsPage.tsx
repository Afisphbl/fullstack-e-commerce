import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Save,
  Plus,
  Trash2,
  MapPin,
  Building2,
  Image as ImageIcon,
  Info,
  Phone,
  Share2,
  ShoppingBag,
  Settings as SettingsIcon,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  useSiteSettings,
  HeroSlide,
  AboutStat,
  AboutValue,
  SiteSettings,
} from "@/contexts/SiteSettingsContext";

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-card">
    <div className="mb-4 flex items-center gap-2">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="font-display font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="text-foreground">{label}</Label>
    <div className="mt-1">{children}</div>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const AdminSettingsPage = () => {
  const { settings, save, reset } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [geocoding, setGeocoding] = useState(false);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save(draft);
    toast({ title: "Settings saved", description: "Changes are live across the site." });
  };

  const handleReset = () => {
    reset();
    toast({ title: "Reset to defaults" });
    setTimeout(() => window.location.reload(), 300);
  };

  // Hero slides
  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const next = [...draft.heroSlides];
    next[idx] = { ...next[idx], ...patch };
    update("heroSlides", next);
  };
  const addSlide = () =>
    update("heroSlides", [
      ...draft.heroSlides,
      { image: "", title: "New Slide", subtitle: "" },
    ]);
  const removeSlide = (idx: number) =>
    update(
      "heroSlides",
      draft.heroSlides.filter((_, i) => i !== idx),
    );

  // About stats / values
  const updateStat = (idx: number, patch: Partial<AboutStat>) => {
    const next = [...draft.aboutStats];
    next[idx] = { ...next[idx], ...patch };
    update("aboutStats", next);
  };
  const addStat = () =>
    update("aboutStats", [...draft.aboutStats, { value: "0", label: "New Stat" }]);
  const removeStat = (idx: number) =>
    update("aboutStats", draft.aboutStats.filter((_, i) => i !== idx));

  const updateValue = (idx: number, patch: Partial<AboutValue>) => {
    const next = [...draft.aboutValues];
    next[idx] = { ...next[idx], ...patch };
    update("aboutValues", next);
  };
  const addValue = () =>
    update("aboutValues", [
      ...draft.aboutValues,
      { title: "New Value", desc: "" },
    ]);
  const removeValue = (idx: number) =>
    update("aboutValues", draft.aboutValues.filter((_, i) => i !== idx));

  // Geocoding via Nominatim (free, no key)
  const findCoords = async () => {
    if (!draft.contactAddress.trim()) {
      toast({ title: "Address required", description: "Enter an address first." });
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(draft.contactAddress)}`,
      );
      const data = await res.json();
      if (data?.[0]) {
        setDraft((d) => ({
          ...d,
          mapLat: parseFloat(data[0].lat).toFixed(6),
          mapLng: parseFloat(data[0].lon).toFixed(6),
        }));
        toast({ title: "Coordinates filled", description: data[0].display_name });
      } else {
        toast({ title: "No results", description: "Try a more specific address." });
      }
    } catch {
      toast({ title: "Lookup failed", description: "Check your connection." });
    } finally {
      setGeocoding(false);
    }
  };

  const mapPreview = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(draft.mapLng) - 0.01},${parseFloat(draft.mapLat) - 0.01},${parseFloat(draft.mapLng) + 0.01},${parseFloat(draft.mapLat) + 0.01}&layer=mapnik&marker=${draft.mapLat},${draft.mapLng}`;

  return (
    <form onSubmit={handleSave}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Storefront Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage everything customers see — hero, about, contact, social and commerce.
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
          <TabsTrigger value="general"><Building2 className="h-3.5 w-3.5 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="hero"><ImageIcon className="h-3.5 w-3.5 mr-1.5" />Hero</TabsTrigger>
          <TabsTrigger value="about"><Info className="h-3.5 w-3.5 mr-1.5" />About</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="h-3.5 w-3.5 mr-1.5" />Contact & Map</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-3.5 w-3.5 mr-1.5" />Social</TabsTrigger>
          <TabsTrigger value="commerce"><ShoppingBag className="h-3.5 w-3.5 mr-1.5" />Commerce</TabsTrigger>
          <TabsTrigger value="prefs"><SettingsIcon className="h-3.5 w-3.5 mr-1.5" />Preferences</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <SectionCard title="Brand Identity" icon={Building2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company Name">
                <Input value={draft.companyName} onChange={(e) => update("companyName", e.target.value)} className="bg-background" />
              </Field>
              <Field label="Tagline">
                <Input value={draft.tagline} onChange={(e) => update("tagline", e.target.value)} className="bg-background" />
              </Field>
            </div>
            <Field label="Logo URL" hint="Optional. Leave blank to keep wordmark.">
              <Input value={draft.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://..." className="bg-background" />
            </Field>
            <Field label="Short Description">
              <Textarea value={draft.description} onChange={(e) => update("description", e.target.value)} className="bg-background" />
            </Field>
          </SectionCard>
        </TabsContent>

        {/* HERO */}
        <TabsContent value="hero" className="space-y-6">
          <SectionCard title="Homepage Hero Content" icon={ImageIcon}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Eyebrow / Badge">
                <Input value={draft.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} className="bg-background" />
              </Field>
              <Field label="CTA Button Text">
                <Input value={draft.heroCtaText} onChange={(e) => update("heroCtaText", e.target.value)} className="bg-background" />
              </Field>
              <Field label="Headline (start)">
                <Input value={draft.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} className="bg-background" />
              </Field>
              <Field label="Highlighted Word" hint="Rendered with gradient.">
                <Input value={draft.heroHighlight} onChange={(e) => update("heroHighlight", e.target.value)} className="bg-background" />
              </Field>
              <Field label="CTA Link">
                <Input value={draft.heroCtaLink} onChange={(e) => update("heroCtaLink", e.target.value)} placeholder="/shop" className="bg-background" />
              </Field>
            </div>
            <Field label="Subtitle">
              <Textarea value={draft.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} className="bg-background" />
            </Field>
          </SectionCard>

          <SectionCard title="Hero Slideshow" icon={ImageIcon}>
            <div className="space-y-3">
              {draft.heroSlides.map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">SLIDE {i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSlide(i)} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Input placeholder="Title" value={s.title} onChange={(e) => updateSlide(i, { title: e.target.value })} />
                    <Input placeholder="Subtitle" value={s.subtitle} onChange={(e) => updateSlide(i, { subtitle: e.target.value })} />
                    <Input placeholder="Image URL" value={s.image} onChange={(e) => updateSlide(i, { image: e.target.value })} />
                  </div>
                  {s.image && (
                    <img src={s.image} alt="" className="mt-3 h-24 w-full rounded object-cover border border-border" />
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" /> Add Slide
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about" className="space-y-6">
          <SectionCard title="About Page Header" icon={Info}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Eyebrow"><Input value={draft.aboutEyebrow} onChange={(e) => update("aboutEyebrow", e.target.value)} className="bg-background" /></Field>
              <Field label="Hero Image URL"><Input value={draft.aboutImage} onChange={(e) => update("aboutImage", e.target.value)} className="bg-background" /></Field>
              <Field label="Title (start)"><Input value={draft.aboutTitle} onChange={(e) => update("aboutTitle", e.target.value)} className="bg-background" /></Field>
              <Field label="Highlighted Word"><Input value={draft.aboutHighlight} onChange={(e) => update("aboutHighlight", e.target.value)} className="bg-background" /></Field>
            </div>
            <Field label="Intro Paragraph">
              <Textarea value={draft.aboutIntro} onChange={(e) => update("aboutIntro", e.target.value)} rows={4} className="bg-background" />
            </Field>
          </SectionCard>

          <SectionCard title="Stats" icon={Info}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {draft.aboutStats.map((s, i) => (
                <div key={i} className="flex items-end gap-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex-1"><Label className="text-xs">Value</Label><Input value={s.value} onChange={(e) => updateStat(i, { value: e.target.value })} /></div>
                  <div className="flex-1"><Label className="text-xs">Label</Label><Input value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })} /></div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addStat}><Plus className="h-4 w-4 mr-2" /> Add Stat</Button>
          </SectionCard>

          <SectionCard title="Core Values" icon={Info}>
            <div className="space-y-3">
              {draft.aboutValues.map((v, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-2 flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeValue(i)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Input placeholder="Title" value={v.title} onChange={(e) => updateValue(i, { title: e.target.value })} />
                    <div className="md:col-span-2"><Input placeholder="Description" value={v.desc} onChange={(e) => updateValue(i, { desc: e.target.value })} /></div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addValue}><Plus className="h-4 w-4 mr-2" /> Add Value</Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact" className="space-y-6">
          <SectionCard title="Contact Information" icon={Phone}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Email"><Input type="email" value={draft.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="bg-background" /></Field>
              <Field label="Phone"><Input value={draft.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="bg-background" /></Field>
            </div>
            <Field label="Address"><Input value={draft.contactAddress} onChange={(e) => update("contactAddress", e.target.value)} className="bg-background" /></Field>
            <Field label="Working Hours" hint="One line per day.">
              <Textarea value={draft.workingHours} onChange={(e) => update("workingHours", e.target.value)} rows={4} className="bg-background" />
            </Field>
          </SectionCard>

          <SectionCard title="Map Location" icon={MapPin}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]"><Label>Latitude</Label><Input value={draft.mapLat} onChange={(e) => update("mapLat", e.target.value)} className="bg-background mt-1" /></div>
              <div className="flex-1 min-w-[140px]"><Label>Longitude</Label><Input value={draft.mapLng} onChange={(e) => update("mapLng", e.target.value)} className="bg-background mt-1" /></div>
              <div className="w-24"><Label>Zoom</Label><Input value={draft.mapZoom} onChange={(e) => update("mapZoom", e.target.value)} className="bg-background mt-1" /></div>
              <Button type="button" onClick={findCoords} disabled={geocoding} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Search className="h-4 w-4 mr-2" />
                {geocoding ? "Searching..." : "Auto-fill from Address"}
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe title="Map preview" src={mapPreview} className="w-full h-64" />
            </div>
          </SectionCard>
        </TabsContent>

        {/* SOCIAL */}
        <TabsContent value="social" className="space-y-6">
          <SectionCard title="Social Media Links" icon={Share2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(["facebook", "instagram", "twitter", "linkedin", "youtube"] as const).map((k) => (
                <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                  <Input
                    value={draft.social[k]}
                    onChange={(e) => update("social", { ...draft.social, [k]: e.target.value })}
                    placeholder={`https://${k}.com/yourbrand`}
                    className="bg-background"
                  />
                </Field>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* COMMERCE */}
        <TabsContent value="commerce" className="space-y-6">
          <SectionCard title="Commerce Settings" icon={ShoppingBag}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Tax Rate (%)"><Input value={draft.taxRate} onChange={(e) => update("taxRate", e.target.value)} className="bg-background" /></Field>
              <Field label="Free Shipping Min ($)"><Input value={draft.freeShippingMin} onChange={(e) => update("freeShippingMin", e.target.value)} className="bg-background" /></Field>
              <Field label="Currency"><Input value={draft.currency} onChange={(e) => update("currency", e.target.value)} className="bg-background" /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        {/* PREFS */}
        <TabsContent value="prefs" className="space-y-6">
          <SectionCard title="System Preferences" icon={SettingsIcon}>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
              <div>
                <Label className="text-foreground">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Disable storefront temporarily.</p>
              </div>
              <Switch checked={draft.maintenanceMode} onCheckedChange={(v) => update("maintenanceMode", v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
              <div>
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified about new orders.</p>
              </div>
              <Switch checked={draft.emailNotifications} onCheckedChange={(v) => update("emailNotifications", v)} />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
          <Save className="h-4 w-4 mr-2" /> Save All Changes
        </Button>
      </div>
    </form>
  );
};

export default AdminSettingsPage;