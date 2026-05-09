import React from 'react';
import { fetchProducts, fetchOrders, fetchCategories } from '@/lib/api';
import { DollarSign, Package, ShoppingCart, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSummaryPage = () => {
  const { data: productsData, isLoading: pLoading } = useQuery({ queryKey: ['adminProducts'], queryFn: () => fetchProducts({ limit: 100 }) });
  const { data: orders = [], isLoading: oLoading } = useQuery({ queryKey: ['adminOrders'], queryFn: fetchOrders });
  const { data: categories = [], isLoading: cLoading } = useQuery({ queryKey: ['adminCategories'], queryFn: fetchCategories });

  const isLoading = pLoading || oLoading || cLoading;

  const revenue = orders.reduce((s, x) => s + x.total, 0);
  const products = productsData?.products?.length || 0;
  const cats = categories.length;
  const avgOrder = revenue / (orders.length || 1);

  const metrics = [
    { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, icon: DollarSign, trend: '+15.3%', up: true },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, trend: '+8.1%', up: true },
    { label: 'Average Order', value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, trend: '+4.2%', up: true },
    { label: 'Products Listed', value: products, icon: Package, trend: '+3', up: true },
    { label: 'Categories', value: cats, icon: Tag, trend: '0', up: true },
    { label: 'Return Rate', value: '2.1%', icon: TrendingDown, trend: '-0.3%', up: false },
  ];


  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Business Summary</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : metrics.map(({ label, value, icon: Icon, trend, up }) => (
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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-12" /></div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : ['January', 'February', 'March', 'April'].map((month, i) => {

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
