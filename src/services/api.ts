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
} from "./types";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
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

  triggerIngestion: () =>
    request<IngestTriggerResponse>("/api/v1/ingest", {
      method: "POST",
    }),

  getIngestionStatus: () =>
    request<IngestStatusResponse>("/api/v1/ingest/status"),

  uploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request<UploadResponse>("/api/v1/documents", {
      method: "POST",
      body: formData,
    });
  },

  listDocuments: () =>
    request<DocumentRecord[]>("/api/v1/documents"),

  getDocument: (id: string) =>
    request<DocumentRecord>(`/api/v1/documents/${id}`),

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
