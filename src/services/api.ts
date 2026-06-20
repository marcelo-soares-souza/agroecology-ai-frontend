import { API_BASE_URL } from "@/config/api";
import i18n from "@/config/i18n";
import type {
  AskRequest,
  AskResponse,
  AnswerResponse,
  ServerStatus,
  IngestStatusResponse,
  IngestTriggerResponse,
  DocumentRecord,
  DocumentStats,
  DocumentUpdateRequest,
  PaginatedResponse,
  PaginationParams,
  MetadataExtractionStatus,
  UploadResponse,
  IngestionRun,
  UserRecord,
  PublicUserRecord,
  HumanChallenge,
  DocumentSuggestion,
  DocumentSuggestionUpdate,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ConfirmEmailRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
} from "./types";

export interface AuthRateLimitInfo {
  retryAfterSeconds?: number;
  blockedUntil?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;
  blockedUntil?: string;

  constructor(
    message: string,
    status: number,
    details?: {
      code?: string;
      retryAfterSeconds?: number;
      blockedUntil?: string;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = details?.code;
    this.retryAfterSeconds = details?.retryAfterSeconds;
    this.blockedUntil = details?.blockedUntil;
  }
}

export function isAuthRateLimitError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    error.status === 429 &&
    error.code === "auth_rate_limited"
  );
}

function getUnexpectedTemporaryErrorMessage(): string {
  return i18n.t("common.unexpectedTemporaryError");
}

function isHtmlResponse(contentType: string | null, text: string): boolean {
  if (contentType?.toLowerCase().includes("text/html")) {
    return true;
  }

  return /<!doctype html|<html[\s>]/i.test(text);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("agroecology_access_token");
  const headers: Record<string, string> = {
    ...(options?.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(getUnexpectedTemporaryErrorMessage(), 0);
  }

  if (!response.ok) {
    const text = await response.text();
    const contentType = response.headers.get("content-type");

    if (response.status >= 500 || isHtmlResponse(contentType, text)) {
      throw new ApiError(getUnexpectedTemporaryErrorMessage(), response.status);
    }

    let message = text || response.statusText;
    let code: string | undefined;
    let retryAfterSeconds: number | undefined;
    let blockedUntil: string | undefined;

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.detail === "string") {
        message = parsed.detail;
      } else if (parsed.detail && typeof parsed.detail === "object") {
        if (typeof parsed.detail.message === "string") {
          message = parsed.detail.message;
        }
        if (typeof parsed.detail.code === "string") {
          code = parsed.detail.code;
        }
        if (typeof parsed.detail.retry_after_seconds === "number") {
          retryAfterSeconds = parsed.detail.retry_after_seconds;
        }
        if (typeof parsed.detail.blocked_until === "string") {
          blockedUntil = parsed.detail.blocked_until;
        }
      }
    } catch {
      // not JSON, use raw text
    }

    const retryAfterHeader = response.headers.get("retry-after");
    if (retryAfterSeconds === undefined && retryAfterHeader) {
      const parsedRetryAfter = Number(retryAfterHeader);
      if (Number.isFinite(parsedRetryAfter)) {
        retryAfterSeconds = parsedRetryAfter;
      }
    }

    throw new ApiError(message, response.status, {
      code,
      retryAfterSeconds,
      blockedUntil,
    });
  }

  return response.json();
}

function buildQueryString(params?: PaginationParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const api = {
  ask: (data: AskRequest) =>
    request<AskResponse>("/api/v1/ask", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAnswer: (taskId: string) =>
    request<AnswerResponse>(`/api/v1/answer/${taskId}`),

  getStatus: () => request<ServerStatus>("/api/v1/status"),

  triggerIngestion: (force = false) =>
    request<IngestTriggerResponse>(
      `/api/v1/ingest${force ? "?force=true" : ""}`,
      { method: "POST" },
    ),

  getIngestionStatus: () =>
    request<IngestStatusResponse>("/api/v1/ingest/status"),

  listIngestionRuns: () => request<IngestionRun[]>("/api/v1/ingestion/runs"),

  getIngestionRun: (runId: string) =>
    request<IngestionRun>(`/api/v1/ingestion/runs/${runId}`),

  uploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request<UploadResponse>("/api/v1/documents", {
      method: "POST",
      body: formData,
    });
  },

  listDocuments: (params?: PaginationParams) =>
    request<PaginatedResponse<DocumentRecord>>(
      `/api/v1/documents${buildQueryString(params)}`,
    ),

  getDocumentStats: () => request<DocumentStats>("/api/v1/documents/stats"),

  getMetadataExtractionStatus: () =>
    request<MetadataExtractionStatus>("/api/v1/documents/metadata-status"),

  getDocument: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}`),

  extractMetadata: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}/extract-metadata`, {
      method: "POST",
    }),

  listUsers: () => request<UserRecord[]>("/api/v1/admin/users"),
  getUser: (id: string) => request<UserRecord>(`/api/v1/admin/users/${id}`),
  updateUser: (id: string, data: Record<string, string | null>) =>
    request<UserRecord>(`/api/v1/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/v1/admin/users/${id}`, {
      method: "DELETE",
    }),

  updateMyProfile: (data: {
    full_name?: string | null;
    about?: string | null;
    link?: string | null;
  }) =>
    request<UserRecord>("/api/v1/auth/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<UserRecord>("/api/v1/auth/me/profile/avatar", {
      method: "POST",
      body: formData,
    });
  },

  getHumanChallenge: async (locale = "en") =>
    request<HumanChallenge>(`/api/v1/auth/human-challenge?locale=${locale}`),

  extractAllMetadata: () =>
    request<{ message: string }>("/api/v1/documents/extract-all-metadata", {
      method: "POST",
    }),

  updateDocument: (id: string, data: DocumentUpdateRequest) =>
    request<DocumentRecord>(`/api/v1/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteDocument: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}`, {
      method: "DELETE",
    }),

  listActiveUsers: (params?: PaginationParams) =>
    request<PaginatedResponse<PublicUserRecord>>(
      `/api/v1/auth/users${buildQueryString(params)}`,
    ),

  login: (data: LoginRequest) =>
    request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<{ message: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirmEmail: (data: ConfirmEmailRequest) =>
    request<{ message: string }>("/api/v1/auth/confirm-email", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestPasswordReset: (email: string) =>
    request<{ message: string }>("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    request<{ message: string }>("/api/v1/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendConfirmation: (email: string) =>
    request<{ message: string }>("/api/v1/auth/confirm-email/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  refreshToken: (refreshToken: string) =>
    request<RefreshTokenResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: () =>
    request<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
    }),

  getMe: () => request<UserRecord>("/api/v1/auth/me"),

  exportMyData: () =>
    request<{ user: Record<string, unknown>; suggestions: unknown[] }>(
      "/api/v1/auth/me/export",
    ),

  requestDeleteAccount: () =>
    request<{ message: string }>("/api/v1/auth/me/delete-request", {
      method: "POST",
    }),

  confirmDeleteAccount: (token: string) =>
    request<{ message: string }>("/api/v1/auth/me/delete-confirm", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  getUserBySlug: (slug: string) =>
    request<UserRecord>(`/api/v1/auth/users/by-slug/${slug}`),

  listPublicSuggestions: (userId: string) =>
    request<DocumentSuggestion[]>(
      `/api/v1/suggestions/public?user_id=${userId}`,
    ),

  createSuggestion: (formData: FormData) =>
    request<DocumentSuggestion>("/api/v1/suggestions", {
      method: "POST",
      body: formData,
    }),

  listMySuggestions: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return request<DocumentSuggestion[]>(`/api/v1/suggestions${params}`);
  },

  getSuggestion: (id: string) =>
    request<DocumentSuggestion>(`/api/v1/suggestions/${id}`),

  getSuggestionFileBlob: async (
    id: string,
  ): Promise<{ blob: Blob; type: string }> => {
    const token = localStorage.getItem("agroecology_access_token");

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/suggestions/${id}/view`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      throw new ApiError(getUnexpectedTemporaryErrorMessage(), 0);
    }

    if (!response.ok) {
      const text = await response.text();
      const contentType = response.headers.get("content-type");

      if (response.status >= 500 || isHtmlResponse(contentType, text)) {
        throw new ApiError(
          getUnexpectedTemporaryErrorMessage(),
          response.status,
        );
      }

      let message = text || response.statusText;
      try {
        const parsed = JSON.parse(text);
        if (parsed.detail) {
          message = parsed.detail;
        }
      } catch {
        // not JSON, use raw text
      }
      throw new ApiError(message, response.status);
    }

    const blob = await response.blob();
    return {
      blob,
      type: response.headers.get("content-type") || "application/pdf",
    };
  },

  updateSuggestion: (id: string, data: DocumentSuggestionUpdate) =>
    request<DocumentSuggestion>(`/api/v1/suggestions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSuggestion: (id: string) =>
    request<DocumentSuggestion>(`/api/v1/suggestions/${id}`, {
      method: "DELETE",
    }),

  replaceSuggestionFile: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<DocumentSuggestion>(`/api/v1/suggestions/${id}/file`, {
      method: "PUT",
      body: formData,
    });
  },

  adminListSuggestions: (filters?: {
    status?: string;
    user_id?: string;
    has_pdf?: boolean;
    q?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.user_id) params.set("user_id", filters.user_id);
    if (filters?.has_pdf !== undefined)
      params.set("has_pdf", String(filters.has_pdf));
    if (filters?.q) params.set("q", filters.q);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));
    const qs = params.toString();
    return request<DocumentSuggestion[]>(
      `/api/v1/admin/suggestions${qs ? `?${qs}` : ""}`,
    );
  },

  adminGetSuggestion: (id: string) =>
    request<DocumentSuggestion>(`/api/v1/admin/suggestions/${id}`),

  adminUpdateSuggestion: (
    id: string,
    data: {
      title?: string | null;
      authors?: string | null;
      url?: string | null;
      user_comment?: string | null;
      admin_comment?: string | null;
    },
  ) =>
    request<DocumentSuggestion>(`/api/v1/admin/suggestions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminApproveSuggestion: (
    id: string,
    data?: { admin_comment?: string | null },
  ) =>
    request<DocumentSuggestion>(`/api/v1/admin/suggestions/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  adminRejectSuggestion: (id: string, data: { admin_comment: string }) =>
    request<DocumentSuggestion>(`/api/v1/admin/suggestions/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminDeleteSuggestion: (id: string) =>
    request<DocumentSuggestion>(`/api/v1/admin/suggestions/${id}`, {
      method: "DELETE",
    }),
};
