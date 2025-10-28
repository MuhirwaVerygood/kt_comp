"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("auth_token");

    if (!isLoading && (!token || !user)) {
      // No token or user, redirect to login
      router.push("/auth/login");
    } else if (!isLoading && user && user.role !== "ADMIN") {
      // User is not admin, redirect to home
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user or not admin, don't render children (will redirect)
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
