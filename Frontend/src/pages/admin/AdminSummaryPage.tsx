import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchOrders, fetchCategories } from '@/lib/api';
import { DollarSign, Package, ShoppingCart, Tag, TrendingUp, TrendingDown } from 'lucide-react';

const AdminSummaryPage = () => {
  const [data, setData] = useState({ products: 0, orders: 0, revenue: 0, categories: 0, avgOrder: 0 });

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders(), fetchCategories()]).then(([pRes, o, c]) => {
      const revenue = o.reduce((s, x) => s + x.total, 0);
      setData({ products: pRes.products.length, orders: o.length, revenue, categories: c.length, avgOrder: revenue / (o.length || 1) });
    });
  }, []);

  const metrics = [
    { label: 'Total Revenue', value: `$${data.revenue.toFixed(2)}`, icon: DollarSign, trend: '+15.3%', up: true },
    { label: 'Total Orders', value: data.orders, icon: ShoppingCart, trend: '+8.1%', up: true },
    { label: 'Average Order', value: `$${data.avgOrder.toFixed(2)}`, icon: TrendingUp, trend: '+4.2%', up: true },
    { label: 'Products Listed', value: data.products, icon: Package, trend: '+3', up: true },
    { label: 'Categories', value: data.categories, icon: Tag, trend: '0', up: true },
    { label: 'Return Rate', value: '2.1%', icon: TrendingDown, trend: '-0.3%', up: false },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Business Summary</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map(({ label, value, icon: Icon, trend, up }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
              <span className={`text-xs flex items-center gap-0.5 ${up ? 'text-success' : 'text-destructive'}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{trend}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">Monthly Performance</h2>
        <div className="space-y-4">
          {['January', 'February', 'March', 'April'].map((month, i) => {
            const value = [65, 72, 88, 95][i];
            return (
              <div key={month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{month}</span>
                  <span className="text-muted-foreground">${(value * 100).toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSummaryPage;
