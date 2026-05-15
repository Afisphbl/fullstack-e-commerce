import React from "react";
import { ShieldAlert } from "lucide-react";
import { AdminUser, AdminUserStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserTableRow } from "./UserTableRow";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useTranslation } from "react-i18next";

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onViewDetails: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onStatusChange: (user: AdminUser, status: AdminUserStatus) => void;
  onRetry: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  isError,
  error,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  onRetry,
}) => {
  const { t } = useTranslation("admin");

  return (
    <div className="overflow-hidden rounded-[24px] border border-border/70">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-4 font-medium max-w-[180px] sm:max-w-none">
                {t("user")}
              </th>
              <th className="px-4 py-4 font-medium">{t("role")}</th>
              <th className="hidden px-4 py-4 font-medium lg:table-cell">
                {t("phone")}
              </th>
              <th className="px-4 py-4 font-medium">{t("status")}</th>
              <th className="hidden px-4 py-4 font-medium xl:table-cell">
                {t("registration")}
              </th>
              <th className="hidden px-4 py-4 font-medium xl:table-cell">
                {t("lastLogin")}
              </th>
              <th className="px-4 py-4 text-right font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 bg-card">
            {isLoading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <ShieldAlert className="h-12 w-12 text-rose-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("failedLoadUsers")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : t("tryAgain")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={onRetry}
                    >
                      {t("tryAgain")}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-16 text-center text-sm text-muted-foreground"
                >
                  {t("noUsersMatch")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
