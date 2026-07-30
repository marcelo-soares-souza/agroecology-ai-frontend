import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
  roles?: string[];
}

export function AuthGuard({ children, roles }: AuthGuardProps) {
  const { isLoading, hasRestoredSession, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading || !hasRestoredSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0) {
    const authorized = roles.some((r) => hasRole(r));
    if (!authorized) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
