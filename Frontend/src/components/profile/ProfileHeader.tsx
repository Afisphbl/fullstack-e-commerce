import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, removeAuthToken } from "@/lib/api-client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ProfileHeader = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/v1/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      // Remove the token from localStorage
      removeAuthToken();
      toast.success("Logged out successfully");
      // Clear all user-related data from cache
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["wishlist"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-display font-bold text-foreground">
        My Profile
      </h1>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        <LogOut className="h-4 w-4" />
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
};
