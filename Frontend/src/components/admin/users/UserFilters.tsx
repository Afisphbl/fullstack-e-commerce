import React from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
] as const;

const ROLES = [
  { value: "all", label: "All roles" },
  { value: "user", label: "Customer" },
  { value: "manager", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "super-admin", label: "Super Admin" },
] as const;

const DEPARTMENTS = [
  { value: "all", label: "All departments" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "delivery", label: "Delivery" },
  { value: "inventory", label: "Inventory" },
] as const;

interface UserFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
  department,
  onDepartmentChange,
}) => {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, email, or phone"
          className="h-11 rounded-xl border-border/80 bg-background pl-10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[170px]">
            <SelectValue placeholder="All status" />
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
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[190px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((item) => (
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
