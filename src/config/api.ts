const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function getDownloadUrl(docId: string): string {
  return `${API_BASE_URL}/api/v1/documents/${docId}/download`;
}

export { API_BASE_URL, getDownloadUrl };
