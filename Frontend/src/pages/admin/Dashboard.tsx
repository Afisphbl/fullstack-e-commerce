import { Users, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/admin/StatsCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentOrders = [
  { id: '#12345', customer: 'John Doe', amount: '$299.00', status: 'Completed', date: '2026-05-07' },
  { id: '#12344', customer: 'Jane Smith', amount: '$149.00', status: 'Processing', date: '2026-05-07' },
  { id: '#12343', customer: 'Bob Johnson', amount: '$599.00', status: 'Completed', date: '2026-05-06' },
  { id: '#12342', customer: 'Alice Brown', amount: '$89.00', status: 'Pending', date: '2026-05-06' },
  { id: '#12341', customer: 'Charlie Wilson', amount: '$399.00', status: 'Completed', date: '2026-05-05' },
];

const topProducts = [
  { name: 'Wireless Headphones', sales: 234, revenue: '$23,400', trend: '+12%' },
  { name: 'Smart Watch', sales: 189, revenue: '$18,900', trend: '+8%' },
  { name: 'Laptop Stand', sales: 156, revenue: '$7,800', trend: '-3%' },
  { name: 'USB-C Cable', sales: 445, revenue: '$4,450', trend: '+25%' },
  { name: 'Phone Case', sales: 312, revenue: '$6,240', trend: '+15%' },
];

export default function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default">Completed</Badge>;
      case 'Processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          icon={DollarSign}
          trend="+20.1%"
          trendLabel="from last month"
        />
        <StatsCard
          title="Total Orders"
          value="1,234"
          icon={ShoppingCart}
          trend="+15.3%"
          trendLabel="from last month"
        />
        <StatsCard
          title="Total Products"
          value="567"
          icon={Package}
          trend="+8"
          trendLabel="new this month"
        />
        <StatsCard
          title="Total Users"
          value="2,345"
          icon={Users}
          trend="+12.5%"
          trendLabel="from last month"
        />
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You have {recentOrders.length} orders this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.revenue}</p>
                    <div className="flex items-center gap-1">
                      {product.trend.startsWith('+') ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs ${
                          product.trend.startsWith('+')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {product.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
