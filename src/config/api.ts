const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function getDownloadUrl(docId: string): string {
  return `${API_BASE_URL}/api/v1/documents/${docId}/download`;
}

function getViewUrl(docId: string): string {
  const token = localStorage.getItem("agroecology_access_token") || "";
  return `${API_BASE_URL}/api/v1/documents/${docId}/view?token=${encodeURIComponent(token)}`;
}

export { API_BASE_URL, getDownloadUrl, getViewUrl };
