import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AdminUser } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface UserStatusChartProps {
  users: AdminUser[];
}

export const UserStatusChart: React.FC<UserStatusChartProps> = ({ users }) => {
  const { t } = useTranslation("admin");

  const chartData = useMemo(() => {
    const counts = [
      {
        name: t("active"),
        value: users.filter((user) => user.status === "active").length,
      },
      {
        name: t("pending"),
        value: users.filter((user) => user.status === "pending").length,
      },
      {
        name: t("suspended"),
        value: users.filter((user) => user.status === "suspended").length,
      },
    ];

    return counts.map((item, index) => ({
      ...item,
      trend: item.value + index + 1,
    }));
  }, [users, t]);

  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {t("statusSnapshot")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("currentDistribution")}
          </p>
        </div>
        <Activity className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="userArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.32}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
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
