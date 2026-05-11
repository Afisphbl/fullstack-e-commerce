import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, Image, FileText, HelpCircle, Share2, Search } from "lucide-react";
import AdminSiteSettings from "@/components/admin/content/AdminSiteSettings";
import AdminHeroSlides from "@/components/admin/content/AdminHeroSlides";
import AdminFeatures from "@/components/admin/content/AdminFeatures";
import AdminPageContent from "@/components/admin/content/AdminPageContent";
import AdminFAQs from "@/components/admin/content/AdminFAQs";
import AdminSocialLinks from "@/components/admin/content/AdminSocialLinks";
import AdminSEOSettings from "@/components/admin/content/AdminSEOSettings";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("site-settings");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your website content, settings, and SEO
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="site-settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Site Settings</span>
          </TabsTrigger>
          <TabsTrigger value="hero-slides" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Hero Slides</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="page-content" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="social-links" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-settings" className="space-y-4">
          <Card className="p-6">
            <AdminSiteSettings />
          </Card>
        </TabsContent>

        <TabsContent value="hero-slides" className="space-y-4">
          <Card className="p-6">
            <AdminHeroSlides />
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="p-6">
            <AdminFeatures />
          </Card>
        </TabsContent>

        <TabsContent value="page-content" className="space-y-4">
          <Card className="p-6">
            <AdminPageContent />
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <Card className="p-6">
            <AdminFAQs />
          </Card>
        </TabsContent>

        <TabsContent value="social-links" className="space-y-4">
          <Card className="p-6">
            <AdminSocialLinks />
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="p-6">
            <AdminSEOSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
