import { useState } from "react";
import { toast } from "sonner";
import { AdminUser, fetchAdminUsers } from "@/lib/api";
import { formatDate, formatDateTime, roleLabel } from "@/lib/utils/formatters";

interface UseUserExportParams {
  tab: string;
  role: string;
  status: string;
  department: string;
  search: string;
}

export const useUserExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (params: UseUserExportParams) => {
    setIsExporting(true);
    try {
      // Fetch all users by paginating through results
      let allUsers: AdminUser[] = [];
      let currentPage = 1;
      const pageLimit = 100;
      let totalUsers = 0;

      // Fetch first page to get total count
      const firstPageData = await fetchAdminUsers({
        tab: params.tab,
        role: params.role,
        status: params.status,
        department: params.department,
        page: currentPage,
        limit: pageLimit,
        search: params.search,
      });

      allUsers = firstPageData.users;
      totalUsers = firstPageData.total;
      const totalPages = Math.ceil(totalUsers / pageLimit);

      // Fetch remaining pages if needed
      while (currentPage < totalPages) {
        currentPage++;
        const pageData = await fetchAdminUsers({
          tab: params.tab,
          role: params.role,
          status: params.status,
          department: params.department,
          page: currentPage,
          limit: pageLimit,
          search: params.search,
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
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
};
