import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { User, ApiResponse, Address } from "@/types/api";

export type { User, Address };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      apiFetch<ApiResponse<User>>("/api/v1/users/me").then(
        (res) => res.data.data,
      ),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const user = !isError && data ? data : null;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
