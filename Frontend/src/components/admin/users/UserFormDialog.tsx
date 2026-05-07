import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = [
  { value: "user", label: "Customer" },
  { value: "manager", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "super-admin", label: "Super Admin" },
] as const;

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
] as const;

const DEPARTMENTS = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "delivery", label: "Delivery" },
  { value: "inventory", label: "Inventory" },
] as const;

const ACCESS_LEVELS = [
  { value: "standard", label: "Standard" },
  { value: "elevated", label: "Elevated" },
  { value: "full", label: "Full" },
] as const;

const userFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  photo: z.string().optional(),
  role: z.enum(["user", "manager", "admin", "super-admin"]),
  status: z.enum(["active", "pending", "suspended"]),
  department: z.enum(["sales", "support", "delivery", "inventory"]).nullable(),
  accessLevel: z.enum(["standard", "elevated", "full"]),
  permissions: z.string().optional(),
  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
}).superRefine((values, ctx) => {
  const isStaff = values.role !== "user";

  if (isStaff && !values.department) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["department"],
      message: "Department is required for staff members",
    });
  }

  if (values.password && values.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "Password must be at least 8 characters",
    });
  }

  if (values.password !== values.passwordConfirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["passwordConfirm"],
      message: "Passwords must match",
    });
  }
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: AdminUser | null;
  isStaffTab: boolean;
  onSubmit: (values: UserFormValues) => void;
  isPending: boolean;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  isStaffTab,
  onSubmit,
  isPending,
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      phone: editingUser?.phone || "",
      photo: editingUser?.photo || "",
      role: editingUser?.role || (isStaffTab ? "manager" : "user"),
      status: editingUser?.status || "active",
      department: editingUser?.department || (isStaffTab ? "sales" : null),
      accessLevel: editingUser?.accessLevel || "standard",
      permissions: editingUser?.permissions.join(", ") || "",
      password: "",
      passwordConfirm: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: editingUser?.name || "",
        email: editingUser?.email || "",
        phone: editingUser?.phone || "",
        photo: editingUser?.photo || "",
        role: editingUser?.role || (isStaffTab ? "manager" : "user"),
        status: editingUser?.status || "active",
        department: editingUser?.department || (isStaffTab ? "sales" : null),
        accessLevel: editingUser?.accessLevel || "standard",
        permissions: editingUser?.permissions.join(", ") || "",
        password: "",
        passwordConfirm: "",
      });
    }
  }, [open, editingUser, isStaffTab, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[28px] border-none p-0 shadow-elevated">
        <DialogHeader className="border-b border-border/70 px-6 py-5">
          <DialogTitle className="text-2xl font-display">
            {editingUser ? "Edit User" : isStaffTab ? "Add Staff Member" : "Add User"}
          </DialogTitle>
          <DialogDescription>
            Update profile details, role access, and operational permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 px-6 py-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "user") {
                          form.setValue("department", null);
                          form.setValue("accessLevel", "standard");
                          form.setValue("permissions", "");
                        } else if (!form.getValues("department")) {
                          form.setValue("department", "sales");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      disabled={form.watch("role") === "user"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {DEPARTMENTS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.watch("role") === "user"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCESS_LEVELS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      disabled={form.watch("role") === "user"}
                      placeholder="orders.manage, users.edit, reports.view"
                      className="rounded-2xl"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter comma-separated permissions for staff and admin roles.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editingUser && (
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {isPending ? "Saving..." : editingUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
