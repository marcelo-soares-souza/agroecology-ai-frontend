export interface AskRequest {
  question: string;
  top_k?: number;
}

export interface AskResponse {
  task_id: string;
  status: string;
}

export interface SourceChunk {
  text: string;
  score: number;
  metadata: {
    source: string;
    chunk_index: number;
    search_type: string;
  };
}

export interface AnswerResponse {
  task_id: string;
  status: "processing" | "done" | "error";
  answer: string | null;
  sources: SourceChunk[] | null;
  error: string | null;
}

export interface ServerStatus {
  index_ready: boolean;
  ingest_status: string;
  chunks_indexed: number;
  active_tasks: number;
  cache_enabled: boolean;
  cache_hits: number;
}

export interface IngestStatusResponse {
  status: "idle" | "processing" | "done" | "error";
  chunks_indexed: number | null;
  error: string | null;
}

export interface IngestTriggerResponse {
  status: string;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  title: string | null;
  authors: string | null;
  url: string | null;
  file_type: string;
  file_size: number;
  directory: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpdateRequest {
  title?: string | null;
  authors?: string | null;
  url?: string | null;
}

export interface UploadedFile {
  id: string;
  filename: string;
  directory: string;
  size: number;
}

export interface SkippedFile {
  filename: string;
  reason: string;
}

export interface UploadResponse {
  uploaded: UploadedFile[];
  skipped: SkippedFile[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  status: "sending" | "thinking" | "done" | "error";
  error?: string;
}
