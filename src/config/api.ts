const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function getDownloadUrl(docId: string): string {
  return buildApiUrl(`/api/v1/documents/${docId}/download`);
}

function getViewUrl(docId: string): string {
  const token = localStorage.getItem("agroecology_access_token") || "";
  return buildApiUrl(
    `/api/v1/documents/${docId}/view?token=${encodeURIComponent(token)}`,
  );
}

export { API_BASE_URL, buildApiUrl, getDownloadUrl, getViewUrl };
