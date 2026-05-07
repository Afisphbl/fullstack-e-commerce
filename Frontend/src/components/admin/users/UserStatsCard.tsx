import React from "react";

interface UserStatsCardProps {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  note,
  icon,
}) => (
  <div className="rounded-[22px] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between">
      <div className="rounded-2xl bg-primary/10 p-2 text-primary">{icon}</div>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  </div>
);
