import React, { useEffect, useState } from 'react';
import { fetchOrders, Order } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  placed: 'bg-primary/10 text-primary border-primary/30',
  processing: 'bg-warning/10 text-warning border-warning/30',
  shipped: 'bg-info/10 text-info border-info/30',
  delivered: 'bg-success/10 text-success border-success/30',
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  useEffect(() => { fetchOrders().then(setOrders); }, []);

  const updateStatus = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Orders</h1>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order ID</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Items</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/50">
                <td className="p-3 text-sm font-medium text-foreground">{o.id}</td>
                <td className="p-3 text-sm text-muted-foreground">{o.date}</td>
                <td className="p-3 text-sm text-muted-foreground">{o.items.length} items</td>
                <td className="p-3 text-sm font-medium text-foreground">${o.total.toFixed(2)}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['placed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(o)} className="text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-foreground">Order {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm"><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{selected.date}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{selected.shippingAddress}</span></div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Items</h4>
                {selected.items.map(i => (
                  <div key={i.productId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <img src={i.image} alt={i.name} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1"><p className="text-sm text-foreground">{i.name}</p><p className="text-xs text-muted-foreground">x{i.quantity}</p></div>
                    <span className="text-sm font-medium text-foreground">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-display font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span><span>${selected.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
