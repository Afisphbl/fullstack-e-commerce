import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AdminUser } from "@/lib/api";

interface UserStatusChartProps {
  users: AdminUser[];
}

export const UserStatusChart: React.FC<UserStatusChartProps> = ({ users }) => {
  const chartData = useMemo(() => {
    const counts = [
      { name: "Active", value: users.filter((user) => user.status === "active").length },
      { name: "Pending", value: users.filter((user) => user.status === "pending").length },
      { name: "Suspended", value: users.filter((user) => user.status === "suspended").length },
    ];

    return counts.map((item, index) => ({
      ...item,
      trend: item.value + index + 1,
    }));
  }, [users]);

  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Status Snapshot
          </h3>
          <p className="text-sm text-muted-foreground">
            Current page distribution
          </p>
        </div>
        <Activity className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="userArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="trend"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#userArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
