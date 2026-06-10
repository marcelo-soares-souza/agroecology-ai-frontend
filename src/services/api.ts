import { API_BASE_URL } from "@/config/api";
import type {
  AskRequest,
  AskResponse,
  AnswerResponse,
  ServerStatus,
  IngestStatusResponse,
  IngestTriggerResponse,
  DocumentRecord,
  DocumentUpdateRequest,
  MetadataExtractionStatus,
  UploadResponse,
  IngestionRun,
  UserRecord,
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

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
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

  return response.json();
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

  listDocuments: () => request<DocumentRecord[]>("/api/v1/documents"),

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

  listActiveUsers: () => request<UserRecord[]>("/api/v1/auth/users"),

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
