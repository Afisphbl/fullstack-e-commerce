import React from "react";
import { Eye, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { AdminUser, AdminUserStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, getInitials, roleLabel } from "@/lib/utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
] as const;

const statusClasses: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  suspended: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
};

const roleClasses: Record<string, string> = {
  user: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  admin: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
};

interface UserTableRowProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onStatusChange: (user: AdminUser, status: AdminUserStatus) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <tr className="group transition-colors hover:bg-muted/30">
      <td className="px-4 py-4">
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={() => onViewDetails(user)}
        >
          <Avatar className="h-11 w-11 border border-border/70">
            <AvatarImage src={user.photo} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </button>
      </td>
      <td className="px-4 py-4">
        <Badge className={cn("rounded-full border px-3 py-1 text-xs font-medium", roleClasses[user.role])}>
          {roleLabel(user.role)}
        </Badge>
      </td>
      <td className="hidden px-4 py-4 text-sm text-muted-foreground lg:table-cell">
        {user.phone || "Not set"}
      </td>
      <td className="px-4 py-4">
        <Badge className={cn("rounded-full border px-3 py-1 text-xs font-medium", statusClasses[user.status])}>
          {user.status}
        </Badge>
      </td>
      <td className="hidden px-4 py-4 text-sm text-muted-foreground xl:table-cell">
        {formatDate(user.createdAt)}
      </td>
      <td className="hidden px-4 py-4 text-sm text-muted-foreground xl:table-cell">
        {formatDateTime(user.lastLogin)}
      </td>
      <td className="px-4 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-xl border border-transparent p-0 transition-all hover:border-border/70 hover:bg-background"
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-xl px-3 py-2.5 transition-colors focus:bg-primary/5 focus:text-primary"
              onClick={() => onViewDetails(user)}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl px-3 py-2.5 transition-colors focus:bg-primary/5 focus:text-primary"
              onClick={() => onEdit(user)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit User</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2.5 transition-colors focus:bg-primary/5 focus:text-primary" asChild>
              <a href={`mailto:${user.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Send Email</span>
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 bg-border/50" />
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Change Status
            </DropdownMenuLabel>
            <div className="px-2 py-1">
              <Select
                value={user.status}
                onValueChange={(val) => onStatusChange(user, val as AdminUserStatus)}
              >
                <SelectTrigger className="h-9 w-full rounded-xl border-border/50 bg-muted/20 text-xs focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="rounded-lg text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenuSeparator className="my-2 bg-border/50" />
            <DropdownMenuItem
              className="rounded-xl px-3 py-2.5 text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700 dark:text-rose-400 dark:focus:bg-rose-950/30"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete User</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
