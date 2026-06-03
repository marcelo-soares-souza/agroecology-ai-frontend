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
  UploadResponse,
  IngestionRun,
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
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
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

  uploadDocuments: (
    files: File[],
    metadata?: { title?: string; authors?: string; url?: string },
  ) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (metadata?.title) formData.append("title", metadata.title);
    if (metadata?.authors) formData.append("authors", metadata.authors);
    if (metadata?.url) formData.append("url", metadata.url);
    return request<UploadResponse>("/api/v1/documents", {
      method: "POST",
      body: formData,
    });
  },

  listDocuments: () => request<DocumentRecord[]>("/api/v1/documents"),

  getDocument: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}`),

  extractMetadata: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}/extract-metadata`, {
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
};
