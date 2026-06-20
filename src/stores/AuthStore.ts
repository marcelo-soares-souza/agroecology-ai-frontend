import i18n from "@/config/i18n";
import { queryClient } from "@/services/QueryClient";
import { api, isAuthRateLimitError } from "@/services/api";
import type { UserRecord } from "@/services/types";

interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  slug: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const TOKEN_KEY = "agroecology_access_token";
const REFRESH_KEY = "agroecology_refresh_token";
const EMAIL_KEY = "agroecology_email";
const FULL_NAME_KEY = "agroecology_full_name";

function decodeJwt(token: string): {
  sub: string;
  roles: string[];
  exp: number;
  email?: string;
  full_name?: string;
} {
  if (typeof window !== "undefined" && window.crypto) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }
  return { sub: "", roles: [], exp: 0 };
}

function createAuthStore() {
  let session: AuthSession | null = null;
  let isLoading = true;
  let hasRestoredSession = false;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((l) => l());
  }

  function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || session?.accessToken || null;
  }

  function clearSession() {
    session = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(FULL_NAME_KEY);
    localStorage.removeItem("agroecology_chat_messages");
    queryClient.clear();
    notify();
  }

  async function login(email: string, password: string) {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      localStorage.setItem(EMAIL_KEY, email);

      const payload = decodeJwt(data.access_token);
      const fullName = payload.full_name || email;
      session = {
        userId: payload.sub,
        email: email,
        fullName,
        slug: payload.sub,
        roles: payload.roles || [],
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: payload.exp * 1000,
      };
      localStorage.setItem(FULL_NAME_KEY, fullName);
      queryClient.invalidateQueries({ queryKey: ["community-users"] });
      fetchProfile();
      notify();
    } catch (err) {
      if (isAuthRateLimitError(err)) {
        throw err;
      }
      const message =
        err instanceof Error ? err.message : i18n.t("auth.loginFailed");
      throw new Error(message, { cause: err });
    }
  }

  async function fetchProfile() {
    if (!session?.accessToken) return;
    try {
      const profile: UserRecord = await api.getMe();
      if (session) {
        session.slug = profile.slug || session.userId;
        if (profile.full_name) {
          session.fullName = profile.full_name;
          localStorage.setItem(FULL_NAME_KEY, profile.full_name);
        }
        notify();
      }
    } catch {
      // Profile fetch is best-effort, ignore failures
    }
  }

  async function register(data: {
    full_name: string;
    email: string;
    password: string;
    challenge_id: string;
    challenge_answer: string;
    locale?: string;
    privacy_policy_accepted?: boolean;
    tos_accepted?: boolean;
  }) {
    try {
      await api.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        challenge_id: data.challenge_id,
        challenge_answer: data.challenge_answer,
        locale: data.locale,
        privacy_policy_accepted: data.privacy_policy_accepted || false,
        tos_accepted: data.tos_accepted || false,
      });
    } catch (err) {
      if (isAuthRateLimitError(err)) {
        throw err;
      }
      const message =
        err instanceof Error ? err.message : i18n.t("auth.registrationFailed");
      throw new Error(message, { cause: err });
    }
  }

  async function confirmEmail(token: string) {
    try {
      await api.confirmEmail({ token });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : i18n.t("auth.confirmationFailed");
      throw new Error(message, { cause: err });
    }
  }

  function logout() {
    try {
      api.logout().catch(() => {});
    } catch {
      // ignore
    }
    clearSession();
  }

  async function restoreSession() {
    isLoading = true;
    notify();
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        const payload = decodeJwt(storedToken);
        if (payload.exp * 1000 > Date.now()) {
          const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
          const storedFullName =
            localStorage.getItem(FULL_NAME_KEY) || storedEmail;
          session = {
            userId: payload.sub,
            email: payload.email || storedEmail,
            fullName: payload.full_name || storedFullName,
            slug: payload.sub,
            roles: payload.roles || [],
            accessToken: storedToken,
            refreshToken: localStorage.getItem(REFRESH_KEY) || "",
            expiresAt: payload.exp * 1000,
          };
        } else {
          // Try refresh
          const refreshToken = localStorage.getItem(REFRESH_KEY);
          if (refreshToken) {
            try {
              const data = await api.refreshToken(refreshToken);
              localStorage.setItem(TOKEN_KEY, data.access_token);
              localStorage.setItem(REFRESH_KEY, data.refresh_token);
              const newPayload = decodeJwt(data.access_token);
              const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
              const storedFullName =
                localStorage.getItem(FULL_NAME_KEY) || storedEmail;
              session = {
                userId: newPayload.sub,
                email: newPayload.email || storedEmail,
                fullName: newPayload.full_name || storedFullName,
                slug: newPayload.sub,
                roles: newPayload.roles || [],
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: newPayload.exp * 1000,
              };
            } catch {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(REFRESH_KEY);
            }
          }
        }
      }
    } catch {
      session = null;
    }
    hasRestoredSession = true;
    isLoading = false;
    notify();
    fetchProfile();
  }

  function isAuthenticated(): boolean {
    return session !== null && session.expiresAt > Date.now();
  }

  function isAdmin(): boolean {
    return isAuthenticated() && (session?.roles || []).includes("admin");
  }

  function hasRole(role: string): boolean {
    return isAuthenticated() && (session?.roles || []).includes(role);
  }

  return {
    get session() {
      return session;
    },
    get isLoading() {
      return isLoading;
    },
    get hasRestoredSession() {
      return hasRestoredSession;
    },
    login,
    register,
    confirmEmail,
    logout,
    clearSession,
    restoreSession,
    isAuthenticated,
    isAdmin,
    hasRole,
    getToken,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const authStore = createAuthStore();
