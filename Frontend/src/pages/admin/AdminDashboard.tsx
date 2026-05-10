import React, { useEffect, useState } from 'react';
import { fetchAdminDashboardData, Product, Order } from '@/lib/api';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Filter, 
  Search,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Globe,
  Heart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { usePageTitle } from '@/hooks/usePageTitle';

const REVENUE_DATA = [
  { name: 'Jan', current: 4000, previous: 2400 },
  { name: 'Feb', current: 3000, previous: 1398 },
  { name: 'Mar', current: 2000, previous: 9800 },
  { name: 'Apr', current: 2780, previous: 3908 },
  { name: 'May', current: 1890, previous: 4800 },
  { name: 'Jun', current: 2390, previous: 3800 },
];

const SALES_BY_LOCATION = [
  { location: 'New York', value: 72000, percentage: 72 },
  { location: 'San Francisco', value: 39000, percentage: 39 },
  { location: 'Sydney', value: 25000, percentage: 25 },
  { location: 'Singapore', value: 61000, percentage: 61 },
];

const SOURCE_DATA = [
  { name: 'Direct', value: 300.56, color: '#3b82f6' },
  { name: 'Affiliate', value: 135.18, color: '#10b981' },
  { name: 'Sponsored', value: 154.02, color: '#8b5cf6' },
  { name: 'E-mail', value: 48.96, color: '#f59e0b' },
];

const AdminDashboard = () => {
  usePageTitle("Admin - Dashboard");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" label="Preparing your dashboard overview..." />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Sales', value: `$${data.revenue.toLocaleString()}`, change: '+14%', isUp: true, icon: DollarSign },
    { label: 'Total Order', value: data.totalOrders.toLocaleString(), change: '-17%', isUp: false, icon: ShoppingCart },
    { label: 'Total Revenue', value: `$${(data.revenue * 0.85).toLocaleString()}`, change: '+14%', isUp: true, icon: TrendingUp },
    { label: 'Total Customer', value: '42,456', change: '-11%', isUp: false, icon: Users },
  ];

  return (
    <div className="space-y-8 pb-8 bg-background">
      {/* Top Section: Welcome and Controls */}
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back to your e-commerce overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 text-foreground"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <button className="text-muted-foreground hover:text-foreground" aria-label="More options"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{card.value}</h3>
                <div className={`flex items-center gap-1 text-xs font-semibold ${card.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {card.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{card.change}</span>
                  <span className="text-muted-foreground font-normal ml-1">in the last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-foreground">Revenue</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">Current Week <span className="text-foreground">$58,211</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs font-medium text-muted-foreground">Previous Week <span className="text-foreground">$68,768</span></span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  tickFormatter={(value) => `${value / 1000}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="hsl(var(--muted))" 
                  strokeWidth={3}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Location */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-display font-bold text-foreground mb-6">Sales By Location</h3>
            <div className="flex justify-center mb-6">
              <div className="relative w-full h-32 bg-muted/40 rounded-lg flex items-center justify-center">
                 <Globe className="h-20 w-20 text-muted-foreground/30" />
                 {/* Mock pins */}
                 <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-primary" />
                 <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-4">
              {SALES_BY_LOCATION.map((loc) => (
                <div key={loc.location}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">{loc.location}</span>
                    <span className="text-foreground font-bold">{(loc.value / 1000).toFixed(0)}K</span>
                  </div>
                  <Progress value={loc.percentage} className="h-1.5 bg-muted" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-display font-bold text-foreground mb-6">Total Sales</h3>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SOURCE_DATA}
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SOURCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {SOURCE_DATA.map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-muted-foreground font-medium">{source.name}</span>
                    </div>
                    <span className="text-foreground font-bold">${source.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-8 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-border">
            <h3 className="font-display font-bold text-foreground">Top Selling Products</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5"><Filter className="h-3.5 w-3.5" /> Filter</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">See All</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topProducts.slice(0, 5).map((product: Product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.imageCover} alt={product.name} className="w-8 h-8 rounded-lg object-cover bg-muted" />
                        <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">${product.price}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px] font-medium bg-muted text-muted-foreground border-none px-2 py-0.5">
                        {typeof product.category === 'string' ? product.category : product.category?.name}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground text-center">{product.sold || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">${((product.sold || 0) * product.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="lg:col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-display font-bold text-foreground">Monthly Target</h3>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground">Target you've set for each month</p>
          </div>

          <div className="py-8 flex flex-col items-center">
             <div className="relative w-48 h-24 overflow-hidden">
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-muted" />
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-primary border-b-transparent border-r-transparent -rotate-45" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                   <span className="text-3xl font-bold text-foreground">75.34%</span>
                   <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full mt-1">
                      <TrendingUp className="h-2 w-2" /> +12%
                   </div>
                </div>
             </div>
             <p className="mt-8 text-[11px] text-muted-foreground text-center px-4">
                You earn $3267 today, its higher than last month keep up your good trends!
             </p>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-border pt-6">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Target</p>
              <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-foreground">
                $25k <TrendingDown className="h-2 w-2 text-rose-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Revenue</p>
              <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-foreground">
                $18k <TrendingUp className="h-2 w-2 text-emerald-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Today</p>
              <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-foreground">
                $1.8k <TrendingUp className="h-2 w-2 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Wishlisted Products Section */}
      {data.wishlistAnalytics && data.wishlistAnalytics.topWishlistedProducts.length > 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-border">
            <div>
              <h3 className="font-display font-bold text-foreground">Most Wishlisted Products</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Products customers love the most • {data.wishlistAnalytics.stats.totalWishlistItems} total items in wishlists
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Avg per user</p>
                <p className="text-sm font-bold text-foreground">{data.wishlistAnalytics.stats.avgWishlistSize.toFixed(1)} items</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>Wishlist Count</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Popularity</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.wishlistAnalytics.topWishlistedProducts.map((item: any, index: number) => (
                  <tr key={item.productId} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">${item.productPrice}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-4 w-4 fill-destructive text-destructive" />
                        <span className="text-sm font-bold text-foreground">{item.wishlistCount}</span>
                        <span className="text-xs text-muted-foreground">users</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={(item.wishlistCount / data.wishlistAnalytics.topWishlistedProducts[0].wishlistCount) * 100} 
                          className="h-2 w-24 bg-muted" 
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {Math.round((item.wishlistCount / data.wishlistAnalytics.topWishlistedProducts[0].wishlistCount) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground" aria-label="More actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
