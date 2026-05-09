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
      payload: any; // Using any to allow File or string for photo
    }) => {
      if (!editingUser && (!payload.password || !payload.passwordConfirm)) {
        throw new Error("Password and confirmation are required for new users");
      }

      // Check if we need to use FormData (e.g., if photo is a File)
      const useFormData = payload.photo instanceof File;

      if (useFormData) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              // Append array items individually for multipart/form-data
              value.forEach((val) => formData.append(key, val));
            } else {
              formData.append(key, value as string | Blob);
            }
          }
        });

        if (editingUser) {
          return updateAdminUser(editingUser.id, formData);
        }
        return createAdminUser(formData);
      }

      // Fallback to JSON if no file is present
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
