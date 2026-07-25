import { useState, useEffect, useCallback } from "react";
import { authStore } from "@/stores/AuthStore";

export function useAuth() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const unsub = authStore.subscribe(forceUpdate);
    return () => {
      unsub();
    };
  }, [forceUpdate]);

  return {
    session: authStore.session,
    isLoading: authStore.isLoading,
    hasRestoredSession: authStore.hasRestoredSession,
    isAuthenticated: authStore.isAuthenticated(),
    isAdmin: authStore.isAdmin(),
    userId: authStore.session?.userId ?? null,
    roles: authStore.session?.roles ?? [],
    login: authStore.login,
    register: authStore.register,
    applyLoginResponse: authStore.applyLoginResponse,
    confirmEmail: authStore.confirmEmail,
    logout: authStore.logout,
    hasRole: authStore.hasRole,
  };
}
