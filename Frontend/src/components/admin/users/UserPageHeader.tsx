import React from "react";
import { BadgeCheck, Bell, Shield, UserCog, Users } from "lucide-react";
import { UserStatsCard } from "./UserStatsCard";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("admin");

  return (
    <section className="rounded-[24px] sm:rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-card overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3.5 w-3.5" />
            {t("adminUserManagement")}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              {t("manageUsersControlCenter")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground w-full">
              {t("manageUsersDesc")}
            </p>
          </div>
        </div>

        <div className="grid w-full gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:w-auto lg:min-w-[420px]">
          <UserStatsCard
            title={t("totalUsers")}
            value={analytics.totalUsers}
            note={t("acrossCustomersTeams")}
            icon={<Users className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title={t("activeUsers")}
            value={analytics.activeUsers}
            note={t("staffEligible")}
            icon={<BadgeCheck className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title={t("totalStaff")}
            value={analytics.totalStaff}
            note={t("adminsOps")}
            icon={<UserCog className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title={t("newThisMonth")}
            value={analytics.newUsersThisMonth}
            note={t("freshRegistrations")}
            icon={<Bell className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  );
};
