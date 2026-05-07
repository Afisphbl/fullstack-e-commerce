import React from "react";
import { Mail, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { AdminUser } from "@/lib/api";
import { formatDate, formatDateTime, getInitials, roleLabel } from "@/lib/utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserDetailCard } from "./UserDetailCard";

interface UserDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
}

export const UserDetailsSheet: React.FC<UserDetailsSheetProps> = ({
  open,
  onOpenChange,
  user,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-border/70 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/70 px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/70">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-display">{user.name}</SheetTitle>
              <SheetDescription className="mt-1">
                {user.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <UserDetailCard label="Role" value={roleLabel(user.role)} />
            <UserDetailCard label="Status" value={user.status} />
            <UserDetailCard label="Phone" value={user.phone || "Not set"} />
            <UserDetailCard label="Department" value={user.department || "None"} />
            <UserDetailCard label="Joined" value={formatDate(user.createdAt)} />
            <UserDetailCard label="Last Login" value={formatDateTime(user.lastLogin)} />
          </div>

          <div className="rounded-[24px] border border-border/70 bg-muted/20 p-5">
            <Label className="text-sm font-semibold text-foreground">Permissions</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No explicit permissions assigned.</p>
              ) : (
                user.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="rounded-full px-3 py-1">
                    {permission}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-lg font-semibold text-foreground">
                  Quick Actions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Manage access and communicate with the user.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button className="rounded-xl" onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => onToggleStatus(user)}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                {user.status === "suspended" ? "Activate Account" : "Suspend Account"}
              </Button>
              <Button variant="outline" className="rounded-xl" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-destructive hover:text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
