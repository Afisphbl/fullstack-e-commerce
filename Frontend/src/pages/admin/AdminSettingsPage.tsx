import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    companyName: 'VoltEdge Electronics',
    email: 'info@voltedge.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive, San Francisco, CA 94105',
    description: 'Your premium destination for cutting-edge electronics.',
    taxRate: '8',
    freeShippingMin: '100',
    maintenanceMode: false,
    emailNotifications: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Settings saved!' });
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Company Settings</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">General</h2>
          <div><Label className="text-foreground">Company Name</Label><Input value={settings.companyName} onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} className="bg-background" /></div>
          <div><Label className="text-foreground">Description</Label><Textarea value={settings.description} onChange={e => setSettings(s => ({ ...s, description: e.target.value }))} className="bg-background" /></div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Contact</h2>
          <div><Label className="text-foreground">Email</Label><Input value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} className="bg-background" /></div>
          <div><Label className="text-foreground">Phone</Label><Input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} className="bg-background" /></div>
          <div><Label className="text-foreground">Address</Label><Input value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} className="bg-background" /></div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Commerce</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-foreground">Tax Rate (%)</Label><Input value={settings.taxRate} onChange={e => setSettings(s => ({ ...s, taxRate: e.target.value }))} className="bg-background" /></div>
            <div><Label className="text-foreground">Free Shipping Min ($)</Label><Input value={settings.freeShippingMin} onChange={e => setSettings(s => ({ ...s, freeShippingMin: e.target.value }))} className="bg-background" /></div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Preferences</h2>
          <div className="flex items-center justify-between">
            <div><Label className="text-foreground">Maintenance Mode</Label><p className="text-xs text-muted-foreground">Disable storefront temporarily</p></div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label className="text-foreground">Email Notifications</Label><p className="text-xs text-muted-foreground">Receive order notifications</p></div>
            <Switch checked={settings.emailNotifications} onCheckedChange={v => setSettings(s => ({ ...s, emailNotifications: v }))} />
          </div>
        </div>

        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
