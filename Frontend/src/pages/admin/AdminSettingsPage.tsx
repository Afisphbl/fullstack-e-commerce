import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { fetchSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SocialLink {
  platform: string;
  url: string;
  _id?: string;
}

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
    onSuccess: (data) => {
      if (data.socialLinks) {
        setSocialLinks(data.socialLinks);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiFetch('/api/v1/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedSettings = {
      siteName: formData.get('siteName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      address: formData.get('address'),
      socialLinks: socialLinks,
      seo: {
        title: formData.get('seoTitle'),
        description: formData.get('seoDescription'),
        keywords: formData.get('seoKeywords'),
      },
      theme: {
        primaryColor: formData.get('primaryColor'),
        accentColor: formData.get('accentColor'),
      },
    };

    updateMutation.mutate(updatedSettings);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Site Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage global site configuration
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">General</h2>
          <div>
            <Label className="text-foreground">Site Name</Label>
            <Input
              name="siteName"
              defaultValue={settings?.siteName}
              className="bg-background"
              required
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Contact Information</h2>
          <div>
            <Label className="text-foreground">Email</Label>
            <Input
              name="contactEmail"
              type="email"
              defaultValue={settings?.contactEmail}
              className="bg-background"
              required
            />
          </div>
          <div>
            <Label className="text-foreground">Phone</Label>
            <Input
              name="contactPhone"
              defaultValue={settings?.contactPhone}
              className="bg-background"
            />
          </div>
          <div>
            <Label className="text-foreground">Address</Label>
            <Textarea
              name="address"
              defaultValue={settings?.address}
              className="bg-background"
              rows={3}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-foreground">Social Links</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Platform (e.g., Facebook)"
                value={link.platform}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="bg-background"
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="bg-background flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">SEO</h2>
          <div>
            <Label className="text-foreground">Meta Title</Label>
            <Input
              name="seoTitle"
              defaultValue={settings?.seo?.title}
              className="bg-background"
            />
          </div>
          <div>
            <Label className="text-foreground">Meta Description</Label>
            <Textarea
              name="seoDescription"
              defaultValue={settings?.seo?.description}
              className="bg-background"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-foreground">Keywords (comma-separated)</Label>
            <Input
              name="seoKeywords"
              defaultValue={settings?.seo?.keywords}
              className="bg-background"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Theme</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Primary Color</Label>
              <Input
                name="primaryColor"
                type="color"
                defaultValue={settings?.theme?.primaryColor || '#3b82f6'}
                className="bg-background h-12"
              />
            </div>
            <div>
              <Label className="text-foreground">Accent Color</Label>
              <Input
                name="accentColor"
                type="color"
                defaultValue={settings?.theme?.accentColor || '#8b5cf6'}
                className="bg-background h-12"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
