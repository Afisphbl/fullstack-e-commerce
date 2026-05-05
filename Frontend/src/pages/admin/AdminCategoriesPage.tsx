import React, { useEffect, useState } from 'react';
import { fetchCategories, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => { fetchCategories().then(setCategories); }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, name: data.get('name') as string } : c));
      toast({ title: 'Category updated!' });
    } else {
      setCategories(prev => [...prev, { id: String(Date.now()), name: data.get('name') as string, icon: 'Package', count: 0, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' }]);
      toast({ title: 'Category created!' });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader><DialogTitle className="font-display text-foreground">{editing ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div><Label className="text-foreground">Name</Label><Input name="name" defaultValue={editing?.name} required className="bg-background" /></div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">{editing ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
            <img src={cat.image} alt={cat.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat.count} products</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(cat); setDialogOpen(true); }} className="text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
