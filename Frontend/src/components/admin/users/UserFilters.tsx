import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface UserFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
}) => {
  const { t } = useTranslation("admin");

  const STATUSES = [
    { value: "all", label: t("allStatus") },
    { value: "active", label: t("active") },
    { value: "pending", label: t("pending") },
    { value: "suspended", label: t("suspended") },
  ] as const;

  const ROLES = [
    { value: "all", label: t("allRoles") },
    { value: "user", label: t("customer") },
    { value: "admin", label: t("admin") },
  ] as const;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchUserPlaceholder")}
          className="h-11 rounded-xl border-border/80 bg-background pl-10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[170px]">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[170px]">
            <SelectValue placeholder={t("allRoles")} />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
