import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import { AdminUser, AdminUserStatus, fetchAdminUsers } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPageHeader } from "@/components/admin/users/UserPageHeader";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserPagination } from "@/components/admin/users/UserPagination";
import { UserStatusChart } from "@/components/admin/users/UserStatusChart";
import { UserNotifications } from "@/components/admin/users/UserNotifications";
import { UserFormDialog } from "@/components/admin/users/UserFormDialog";
import { UserDetailsSheet } from "@/components/admin/users/UserDetailsSheet";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { useUserFilters } from "@/components/admin/users/hooks/useUserFilters";
import { useUserMutations } from "@/components/admin/users/hooks/useUserMutations";
import { useUserExport } from "@/components/admin/users/hooks/useUserExport";



const AdminUsersPage = () => {
  const {
    searchInput,
    setSearchInput,
    deferredSearch,
    tab,
    role,
    status,
    page,
    updateParams,
  } = useUserFilters();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const limit = 10;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-users", tab, role, status, page, deferredSearch],
    queryFn: () =>
      fetchAdminUsers({
        tab,
        role,
        status,
        page,
        limit,
        search: deferredSearch,
      }),
    refetchInterval: 30000,
  });

  const { saveMutation, deleteMutation, toggleStatusMutation } = useUserMutations();
  const { exportCsv, isExporting } = useUserExport();

  const users = data?.users || [];
  const totalPages = Math.max(Math.ceil((data?.total || 0) / limit), 1);
  const isStaffTab = tab === "staff";

  const openCreateDialog = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleFormSubmit = (values: {
    name: string;
    email: string;
    phone?: string;
    photo?: any;
    role: "user" | "admin";
    status: "active" | "pending" | "suspended";
    permissions?: string;
    password?: string;
    passwordConfirm?: string;
  }) => {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone || "",
      photo: values.photo || "",
      role: values.role,
      status: values.status,
      permissions:
        values.role === "user"
          ? []
          : (values.permissions || "")
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean),
      password: values.password || undefined,
      passwordConfirm: values.passwordConfirm || undefined,
    };

    saveMutation.mutate(
      { editingUser, payload },
      {
        onSuccess: () => {
          setDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (userId: string) => {
    deleteMutation.mutate(userId, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDetailsOpen(false);
      },
    });
  };

  const handleToggleStatus = (user: AdminUser) => {
    const nextStatus: AdminUserStatus = user.status === "suspended" ? "active" : "suspended";
    toggleStatusMutation.mutate({ user, nextStatus });
  };

  const handleExport = () => {
    exportCsv({
      tab,
      role,
      status,
      search: deferredSearch,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <UserPageHeader
        analytics={{
          totalUsers: data?.analytics.totalUsers || 0,
          activeUsers: data?.analytics.activeUsers || 0,
          totalStaff: data?.analytics.totalStaff || 0,
          newUsersThisMonth: data?.analytics.newUsersThisMonth || 0,
        }}
        isLoading={isLoading}
      />


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
                <Button variant="outline" className="rounded-xl" onClick={handleExport} disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export CSV"}
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

            <UserFilters
              searchInput={searchInput}
              onSearchChange={setSearchInput}
              status={status}
              onStatusChange={(value) => updateParams({ status: value, page: "1" })}
              role={role}
              onRoleChange={(value) => updateParams({ role: value, page: "1" })}
            />

            <UserTable
              users={users}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onViewDetails={(user) => {
                setSelectedUser(user);
                setDetailsOpen(true);
              }}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
              onStatusChange={(user, status) => toggleStatusMutation.mutate({ user, nextStatus: status })}
              onRetry={refetch}
            />

            <UserPagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={data?.total || 0}
              currentRecords={users.length}
              isFetching={isFetching}
              isLoading={isLoading}
              onPageChange={(newPage) => updateParams({ page: String(newPage) })}
            />
          </div>
        </div>

        <div className="space-y-6">
          <UserStatusChart users={users} />
          <UserNotifications events={data?.recentEvents || []} />
        </div>
      </section>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        isStaffTab={isStaffTab}
        onSubmit={handleFormSubmit}
        isPending={saveMutation.isPending}
      />

      <UserDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={selectedUser}
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
        onToggleStatus={handleToggleStatus}
      />

      <DeleteUserDialog
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
