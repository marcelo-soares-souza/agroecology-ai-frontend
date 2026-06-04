import { buildApiUrl } from "@/config/api";

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

  async function login(email: string, password: string) {
    const resp = await fetch(buildApiUrl("/api/v1/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Login failed");
    }
    const data = await resp.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);

    const payload = decodeJwt(data.access_token);
    session = {
      userId: payload.sub,
      email: email,
      fullName: payload.full_name || email,
      slug: payload.sub,
      roles: payload.roles || [],
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: payload.exp * 1000,
    };
    fetchProfile();
    notify();
  }

  async function fetchProfile() {
    if (!session?.accessToken) return;
    try {
      const resp = await fetch(buildApiUrl("/api/v1/auth/me"), {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (resp.ok) {
        const profile = await resp.json();
        if (session) {
          session.slug = profile.slug || session.userId;
          notify();
        }
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
  }) {
    const resp = await fetch(buildApiUrl("/api/v1/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp
        .json()
        .catch(() => ({ detail: "Registration failed" }));
      throw new Error(err.detail || "Registration failed");
    }
  }

  async function confirmEmail(token: string) {
    const resp = await fetch(buildApiUrl("/api/v1/auth/confirm-email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!resp.ok) {
      const err = await resp
        .json()
        .catch(() => ({ detail: "Confirmation failed" }));
      throw new Error(err.detail || "Confirmation failed");
    }
  }

  function logout() {
    const token = getToken();
    if (token) {
      fetch(buildApiUrl("/api/v1/auth/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    session = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    notify();
  }

  async function restoreSession() {
    isLoading = true;
    notify();
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        const payload = decodeJwt(storedToken);
        if (payload.exp * 1000 > Date.now()) {
          session = {
            userId: payload.sub,
            email: payload.email || "",
            fullName: payload.full_name || "",
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
            const resp = await fetch(
              buildApiUrl(`/api/v1/auth/refresh?refresh_token=${refreshToken}`),
              { method: "POST" },
            );
            if (resp.ok) {
              const data = await resp.json();
              localStorage.setItem(TOKEN_KEY, data.access_token);
              localStorage.setItem(REFRESH_KEY, data.refresh_token);
              const newPayload = decodeJwt(data.access_token);
              session = {
                userId: newPayload.sub,
                email: newPayload.email || "",
                fullName: newPayload.full_name || "",
                slug: newPayload.sub,
                roles: newPayload.roles || [],
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: newPayload.exp * 1000,
              };
            } else {
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
