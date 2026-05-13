import { useEffect, useState } from "react";
import {
  fetchAdminDashboardData,
  Product,
  AdminDashboardData,
} from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePageTitle } from "@/hooks/usePageTitle";

// Extended product type for dashboard — includes totalRevenue from order aggregation
interface DashboardProduct extends Product {
  totalRevenue?: number;
}

const AdminDashboard = () => {
  usePageTitle("Admin - Dashboard");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Preparing your dashboard overview..."
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Sales",
      value: formatCurrency(data.revenue),
      change: `${data.stats?.revenueGrowth || 0}%`,
      isUp: (data.stats?.revenueGrowth || 0) >= 0,
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      change: `${data.stats?.orderGrowth || 0}%`,
      isUp: (data.stats?.orderGrowth || 0) >= 0,
      icon: ShoppingCart,
    },
    {
      label: "Total Products",
      value: data.totalProducts.toLocaleString(),
      change: "0%",
      isUp: true,
      icon: TrendingUp,
    },
    {
      label: "Total Customers",
      value: data.totalCustomers.toLocaleString(),
      change: `${data.stats?.customerGrowth || 0}%`,
      isUp: true,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 pb-8 bg-background">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <button
                className="text-muted-foreground hover:text-foreground"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </h3>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${card.isUp ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {card.isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{card.change}</span>
                  <span className="text-muted-foreground font-normal ml-1">
                    in the last month
                  </span>
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
                <span className="text-xs font-medium text-muted-foreground">
                  Current Trend
                </span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Sales (Category Distribution) */}
        <div className="lg:col-span-4">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border h-full">
            <h3 className="font-display font-bold text-foreground mb-6">
              Sales By Category
            </h3>
            <div className="flex flex-col items-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categorySales}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Sales",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3">
                {data.categorySales.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-muted-foreground font-medium">
                        {source.name}
                      </span>
                    </div>
                    <span className="text-foreground font-bold">
                      {formatCurrency(source.value)}
                    </span>
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
            <h3 className="font-display font-bold text-foreground">
              Top Selling Products
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                See All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Quantity Sold</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topProducts.slice(0, 5).map((product: Product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || product.imageCover}
                          alt={product.name}
                          className="w-8 h-8 rounded-lg object-cover bg-muted"
                        />
                        <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium bg-muted text-muted-foreground border-none px-2 py-0.5"
                      >
                        {typeof product.category === "string"
                          ? product.category
                          : product.category?.name}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground text-center">
                      {product.sold || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {formatCurrency(
                        (product as DashboardProduct).totalRevenue ??
                          (product.sold || 0) * product.price
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Target (Semi-dynamic based on revenue) */}
        <div className="lg:col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-display font-bold text-foreground">
                Current Performance
              </h3>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground">
              Overview of your store's performance
            </p>
          </div>

          <div className="py-8 flex flex-col items-center">
            <div className="relative w-48 h-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-muted" />
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-primary border-b-transparent border-r-transparent -rotate-45" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className="text-3xl font-bold text-foreground">
                  {data.stats?.revenueGrowth || 0}%
                </span>
                <div
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${(data.stats?.revenueGrowth || 0) >= 0 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "text-rose-500 bg-rose-50"}`}
                >
                  {(data.stats?.revenueGrowth || 0) >= 0 ? (
                    <TrendingUp className="h-2 w-2" />
                  ) : (
                    <TrendingDown className="h-2 w-2" />
                  )}
                  {data.stats?.revenueGrowth || 0}%
                </div>
              </div>
            </div>
            <p className="mt-8 text-[11px] text-muted-foreground text-center px-4">
              Your revenue changed by {data.stats?.revenueGrowth || 0}% compared
              to last month.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border pt-6">
            <div className="text-center border-r border-border">
              <p className="text-[10px] text-muted-foreground mb-1">
                Total Orders
              </p>
              <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-foreground">
                {data.totalOrders.toLocaleString()}{" "}
                {(data.stats?.orderGrowth || 0) >= 0 ? (
                  <TrendingUp className="h-2 w-2 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-2 w-2 text-rose-500" />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">
                Total Revenue
              </p>
              <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-foreground">
                {formatCurrency(data.revenue)}{" "}
                {(data.stats?.revenueGrowth || 0) >= 0 ? (
                  <TrendingUp className="h-2 w-2 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-2 w-2 text-rose-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Wishlisted Products Section */}
      {data.wishlistAnalytics &&
        data.wishlistAnalytics.topWishlistedProducts.length > 0 && (
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div>
                <h3 className="font-display font-bold text-foreground">
                  Most Wishlisted Products
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Products customers love the most •{" "}
                  {data.wishlistAnalytics.stats.totalWishlistItems} total items
                  in wishlists
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Avg per user</p>
                  <p className="text-sm font-bold text-foreground">
                    {data.wishlistAnalytics?.stats.avgWishlistSize.toFixed(1)}{" "}
                    items
                  </p>
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
                  {data.wishlistAnalytics?.topWishlistedProducts.map(
                    (item, index) => (
                      <tr
                        key={item.productId}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover bg-muted"
                              />
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {formatCurrency(item.productPrice)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Heart className="h-4 w-4 fill-destructive text-destructive" />
                            <span className="text-sm font-bold text-foreground">
                              {item.wishlistCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              users
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {(() => {
                              const maxWishlistCount =
                                data.wishlistAnalytics?.topWishlistedProducts[0]
                                  ?.wishlistCount || 1;
                              const percentage = Math.round(
                                (item.wishlistCount / maxWishlistCount) * 100
                              );
                              return (
                                <>
                                  <Progress
                                    value={percentage}
                                    className="h-2 w-24 bg-muted"
                                  />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {percentage}%
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;
