import React, { useEffect, useMemo, useState, useDeferredValue } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import * as z from "zod";
import {
  Activity,
  BadgeCheck,
  Bell,
  Download,
  Eye,
  Filter,
  Mail,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCog,
  Users,
  Loader2,
  MoreHorizontal,
  MoreVertical
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  AdminUser,
  AdminUserStatus,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ROLES = [
  { value: "all", label: "All roles" },
  { value: "user", label: "Customer" },
  { value: "manager", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "super-admin", label: "Super Admin" },
] as const;

const STATUSES = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
] as const;

const DEPARTMENTS = [
  { value: "all", label: "All departments" },
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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (value?: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const roleLabel = (role: string) => {
  if (role === "user") return "Customer";
  if (role === "manager") return "Staff";
  if (role === "super-admin") return "Super Admin";
  return "Admin";
};

const statusClasses: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  suspended: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
};

const roleClasses: Record<string, string> = {
  user: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  manager: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
  admin: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
  "super-admin": "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/60 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const deferredSearch = useDeferredValue(searchInput);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const tab = searchParams.get("tab") || "all";
  const role = searchParams.get("role") || "all";
  const status = searchParams.get("status") || "all";
  const department = searchParams.get("department") || "all";
  const page = Number(searchParams.get("page") || "1");
  const limit = 10;
  const searchParamString = searchParams.toString();

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!next.get("page")) next.set("page", "1");
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParamString, searchParams]);

  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (deferredSearch !== current) {
      const next = new URLSearchParams(searchParams);
      if (deferredSearch) next.set("search", deferredSearch);
      else next.delete("search");
      next.set("page", "1");
      setSearchParams(next);
    }
  }, [deferredSearch, searchParamString, searchParams, setSearchParams]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-users", tab, role, status, department, page, deferredSearch],
    queryFn: () =>
      fetchAdminUsers({
        tab,
        role,
        status,
        department,
        page,
        limit,
        search: deferredSearch,
      }),
    refetchInterval: 30000,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      photo: "",
      role: "user",
      status: "active",
      department: null,
      accessLevel: "standard",
      permissions: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const users = data?.users || [];
  const totalPages = Math.max(Math.ceil((data?.total || 0) / limit), 1);
  const isStaffTab = tab === "staff";

  const chartData = useMemo(() => {
    const counts = [
      { name: "Active", value: users.filter((user) => user.status === "active").length },
      { name: "Pending", value: users.filter((user) => user.status === "pending").length },
      { name: "Suspended", value: users.filter((user) => user.status === "suspended").length },
    ];

    return counts.map((item, index) => ({
      ...item,
      trend: item.value + index + 1,
    }));
  }, [users]);

  const openCreateDialog = () => {
    setEditingUser(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      photo: "",
      role: isStaffTab ? "manager" : "user",
      status: "active",
      department: isStaffTab ? "sales" : null,
      accessLevel: "standard",
      permissions: "",
      password: "",
      passwordConfirm: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
      role: user.role,
      status: user.status,
      department: user.department,
      accessLevel: user.accessLevel || "standard",
      permissions: user.permissions.join(", "),
      password: "",
      passwordConfirm: "",
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      if (!editingUser && (!values.password || !values.passwordConfirm)) {
        throw new Error("Password and confirmation are required for new users");
      }

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone || "",
        photo: values.photo || "",
        role: values.role,
        status: values.status,
        department: values.role === "user" ? null : values.department,
        accessLevel: values.role === "user" ? "standard" : values.accessLevel,
        permissions:
          values.role === "user"
            ? []
            : (values.permissions || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        password: values.password || undefined,
        passwordConfirm: values.passwordConfirm || undefined,
      };

      if (editingUser) {
        return updateAdminUser(editingUser.id, payload);
      }

      return createAdminUser(payload);
    },
    onSuccess: () => {
      toast.success(editingUser ? "User updated" : "User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ user, nextStatus }: { user: AdminUser; nextStatus: AdminUserStatus }) =>
      updateAdminUser(user.id, { status: nextStatus }),
    onSuccess: (_, variables) => {
      toast.success(`Status updated to ${variables.nextStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update account status");
    },
  });

  const exportCsv = async () => {
    try {
      // Fetch all users by paginating through results
      let allUsers: AdminUser[] = [];
      let currentPage = 1;
      const pageLimit = 100;
      let totalUsers = 0;

      // Fetch first page to get total count
      const firstPageData = await fetchAdminUsers({
        tab,
        role,
        status,
        department,
        page: currentPage,
        limit: pageLimit,
        search: deferredSearch,
      });

      allUsers = firstPageData.users;
      totalUsers = firstPageData.total;
      const totalPages = Math.ceil(totalUsers / pageLimit);

      // Fetch remaining pages if needed
      while (currentPage < totalPages) {
        currentPage++;
        const pageData = await fetchAdminUsers({
          tab,
          role,
          status,
          department,
          page: currentPage,
          limit: pageLimit,
          search: deferredSearch,
        });
        allUsers = [...allUsers, ...pageData.users];
      }

      if (allUsers.length === 0) {
        toast.info("No users to export");
        return;
      }

      const rows = allUsers.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: roleLabel(user.role),
        status: user.status,
        department: user.department || "",
        accessLevel: user.accessLevel || "",
        createdAt: formatDate(user.createdAt),
        lastLogin: formatDateTime(user.lastLogin),
      }));

      const headers = Object.keys(rows[0] || {
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "",
        department: "",
        accessLevel: "",
        createdAt: "",
        lastLogin: "",
      });

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => `"${String(row[header as keyof typeof row] ?? "").replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-users-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allUsers.length} user${allUsers.length !== 1 ? 's' : ''} to CSV`);
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              Admin user management
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
                Manage customers, staff, and privileged access from one control center.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                This workspace is connected to the backend user API, supports live filtering with URL state, and keeps account operations fast for daily admin work.
              </p>
            </div>
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[420px]">
            <StatCard
              title="Total users"
              value={data?.analytics.totalUsers || 0}
              note="Across customers and internal teams"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Active users"
              value={data?.analytics.activeUsers || 0}
              note="Eligible to access the platform"
              icon={<BadgeCheck className="h-5 w-5" />}
            />
            <StatCard
              title="Total staff"
              value={data?.analytics.totalStaff || 0}
              note="Admins, managers, and operations"
              icon={<UserCog className="h-5 w-5" />}
            />
            <StatCard
              title="New this month"
              value={data?.analytics.newUsersThisMonth || 0}
              note="Fresh registrations in the current month"
              icon={<Bell className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-card">
          <div className="border-b border-border/70 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-display font-semibold text-foreground">
                  User Management
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage roles, permissions, account status, registration details, and staff assignments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button className="rounded-xl shadow-sm" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isStaffTab ? "Add Staff" : "Add User"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <Tabs
              value={tab}
              onValueChange={(value) =>
                updateParams({
                  tab: value === "all" ? null : value,
                  page: "1",
                })
              }
            >
              <TabsList className="grid w-full max-w-[320px] grid-cols-2 rounded-2xl bg-muted/60 p-1">
                <TabsTrigger value="all" className="rounded-xl">
                  All Users
                </TabsTrigger>
                <TabsTrigger value="staff" className="rounded-xl">
                  Staff Members
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="h-11 rounded-xl border-border/80 bg-background pl-10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={status}
                  onValueChange={(value) => updateParams({ status: value, page: "1" })}
                >
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

                <Select
                  value={role}
                  onValueChange={(value) => updateParams({ role: value, page: "1" })}
                >
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

                <Select
                  value={department}
                  onValueChange={(value) => updateParams({ department: value, page: "1" })}
                >
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

            <div className="overflow-hidden rounded-[24px] border border-border/70">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-4 font-medium">User</th>
                      <th className="px-4 py-4 font-medium">Role</th>
                      <th className="hidden px-4 py-4 font-medium lg:table-cell">Phone</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="hidden px-4 py-4 font-medium xl:table-cell">Registration</th>
                      <th className="hidden px-4 py-4 font-medium xl:table-cell">Last login</th>
                      <th className="px-4 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70 bg-card">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7}>
                          <LoadingSpinner label="Loading user data from the backend..." />
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16">
                          <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <ShieldAlert className="h-12 w-12 text-rose-500" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Failed to load users
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {error instanceof Error ? error.message : "An unexpected error occurred"}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => refetch()}
                            >
                              Try Again
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                          No users match the current filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="group transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              className="flex items-center gap-3 text-left"
                              onClick={() => {
                                setSelectedUser(user);
                                setDetailsOpen(true);
                              }}
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
                            <div className="space-y-2">
                              <Badge className={cn("rounded-full border px-3 py-1 text-xs font-medium", roleClasses[user.role])}>
                                {roleLabel(user.role)}
                              </Badge>
                              {user.department && (
                                <p className="text-xs capitalize text-muted-foreground">
                                  {user.department}
                                </p>
                              )}
                            </div>
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
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  className="rounded-xl px-3 py-2.5 transition-colors focus:bg-primary/5 focus:text-primary"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-xl px-3 py-2.5 transition-colors focus:bg-primary/5 focus:text-primary"
                                  onClick={() => openEditDialog(user)}
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
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change Status</DropdownMenuLabel>
                                <div className="px-2 py-1">
                                  <Select
                                    value={user.status}
                                    onValueChange={(val) => toggleStatusMutation.mutate({ user, nextStatus: val as AdminUserStatus })}
                                  >
                                    <SelectTrigger className="h-9 w-full rounded-xl border-border/50 bg-muted/20 text-xs focus:ring-0 focus:ring-offset-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                      {STATUSES.filter(s => s.value !== 'all').map((s) => (
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
                                  onClick={() => setDeleteTarget(user)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {data?.total || 0} records
                {isFetching && !isLoading ? " • Refreshing..." : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <div className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Status Snapshot
                </h3>
                <p className="text-sm text-muted-foreground">
                  Current page distribution
                </p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-5 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="userArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="trend"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#userArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Updated every 30 seconds
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Bell className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(data?.recentEvents || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  No recent user events yet.
                </div>
              ) : (
                data?.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(event.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
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
                          {ROLES.filter((item) => item.value !== "all").map((item) => (
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
                          {STATUSES.filter((item) => item.value !== "all").map((item) => (
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
                          {DEPARTMENTS.filter((item) => item.value !== "all").map((item) => (
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
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full border-l border-border/70 p-0 sm:max-w-xl">
          {selectedUser && (
            <>
              <SheetHeader className="border-b border-border/70 px-6 py-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border/70">
                    <AvatarImage src={selectedUser.photo} alt={selectedUser.name} />
                    <AvatarFallback className="bg-primary/10 text-lg text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl font-display">{selectedUser.name}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {selectedUser.email}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <DetailCard label="Role" value={roleLabel(selectedUser.role)} />
                  <DetailCard label="Status" value={selectedUser.status} />
                  <DetailCard label="Phone" value={selectedUser.phone || "Not set"} />
                  <DetailCard label="Department" value={selectedUser.department || "None"} />
                  <DetailCard label="Joined" value={formatDate(selectedUser.createdAt)} />
                  <DetailCard label="Last Login" value={formatDateTime(selectedUser.lastLogin)} />
                </div>

                <div className="rounded-[24px] border border-border/70 bg-muted/20 p-5">
                  <Label className="text-sm font-semibold text-foreground">Permissions</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUser.permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No explicit permissions assigned.</p>
                    ) : (
                      selectedUser.permissions.map((permission) => (
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
                    <Button className="rounded-xl" onClick={() => openEditDialog(selectedUser)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit User
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          user: selectedUser,
                          nextStatus: selectedUser.status === "suspended" ? "active" : "suspended",
                        })
                      }
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      {selectedUser.status === "suspended" ? "Activate Account" : "Suspend Account"}
                    </Button>
                    <Button variant="outline" className="rounded-xl" asChild>
                      <a href={`mailto:${selectedUser.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(selectedUser)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[24px] border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the account record for {deleteTarget?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;
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

const IconButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-9 w-9 rounded-xl border border-transparent text-muted-foreground transition-all hover:border-border/70 hover:bg-background hover:text-foreground"
    onClick={onClick}
    title={label}
  >
    {children}
  </Button>
);

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm font-medium capitalize text-foreground">{value}</p>
  </div>
);

export default AdminUsersPage;
