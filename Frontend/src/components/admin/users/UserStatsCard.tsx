import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStatsCardProps {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  note,
  icon,
  isLoading,
}) => (
  <div className="rounded-[22px] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between">
      <div className="rounded-2xl bg-primary/10 p-2 text-primary">{icon}</div>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
    <div className="mt-4">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </>
      )}
    </div>
  </div>
);

