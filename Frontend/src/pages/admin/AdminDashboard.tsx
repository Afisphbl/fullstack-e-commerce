import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchOrders, fetchCategories } from '@/lib/api';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, categories: 0 });

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders(), fetchCategories()]).then(([pRes, o, c]) => {
      setStats({ products: pRes.products.length, orders: o.length, revenue: o.reduce((s, x) => s + x.total, 0), categories: c.length });
    });
  }, []);

  const cards = [
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, change: '+12.5%' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, change: '+8.2%' },
    { label: 'Products', value: stats.products, icon: Package, change: '+3' },
    { label: 'Categories', value: stats.categories, icon: Users, change: '+1' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
              <span className="text-xs text-success flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{change}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {['New order #ORD-2026-003 received', 'Product stock updated: CyberBuds', 'New customer registration', 'Order #ORD-2026-001 delivered'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{item}</p>
                <span className="text-xs text-muted-foreground ml-auto">{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Product', to: '/admin/products' },
              { label: 'View Orders', to: '/admin/orders' },
              { label: 'POS Terminal', to: '/admin/pos' },
              { label: 'Settings', to: '/admin/settings' },
            ].map(({ label, to }) => (
              <a key={label} href={to} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
