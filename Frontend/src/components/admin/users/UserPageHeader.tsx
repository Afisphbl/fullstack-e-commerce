import React from "react";
import { BadgeCheck, Bell, Shield, UserCog, Users } from "lucide-react";
import { UserStatsCard } from "./UserStatsCard";

interface UserPageHeaderProps {
  analytics: {
    totalUsers: number;
    activeUsers: number;
    totalStaff: number;
    newUsersThisMonth: number;
  };
  isLoading?: boolean;
}

export const UserPageHeader: React.FC<UserPageHeaderProps> = ({
  analytics,
  isLoading,
}) => {
  return (
    <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-card">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3.5 w-3.5" />
            Admin user management
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Manage customers, staff, and privileged access from one control
              center.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              This workspace is connected to the backend user API, supports live
              filtering with URL state, and keeps account operations fast for
              daily admin work.
            </p>
          </div>
        </div>

        <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[420px]">
          <UserStatsCard
            title="Total users"
            value={analytics.totalUsers}
            note="Across customers and internal teams"
            icon={<Users className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title="Active users"
            value={analytics.activeUsers}
            note="Eligible to access the platform"
            icon={<BadgeCheck className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title="Total staff"
            value={analytics.totalStaff}
            note="Admins and operations"
            icon={<UserCog className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title="New this month"
            value={analytics.newUsersThisMonth}
            note="Fresh registrations in the current month"
            icon={<Bell className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  );
};
