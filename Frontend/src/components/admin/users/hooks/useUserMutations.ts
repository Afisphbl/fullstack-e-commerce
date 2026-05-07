import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AdminUser,
  AdminUserStatus,
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
} from "@/lib/api";

interface UserFormPayload {
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: "user" | "manager" | "admin" | "super-admin";
  status: AdminUserStatus;
  department: "sales" | "support" | "delivery" | "inventory" | null;
  accessLevel: "standard" | "elevated" | "full";
  permissions: string[];
  password?: string;
  passwordConfirm?: string;
}

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({
      editingUser,
      payload,
    }: {
      editingUser: AdminUser | null;
      payload: UserFormPayload;
    }) => {
      if (!editingUser && (!payload.password || !payload.passwordConfirm)) {
        throw new Error("Password and confirmation are required for new users");
      }

      if (editingUser) {
        return updateAdminUser(editingUser.id, payload);
      }

      return createAdminUser(payload);
    },
    onSuccess: (_, variables) => {
      toast.success(variables.editingUser ? "User updated" : "User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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

  return {
    saveMutation,
    deleteMutation,
    toggleStatusMutation,
  };
};
