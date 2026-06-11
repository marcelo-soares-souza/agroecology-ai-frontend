export interface AskRequest {
  question: string;
  top_k?: number;
  history?: { role: string; content: string }[];
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
    title?: string;
    document_id?: string;
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
  schema_mismatch?: boolean;
  index_version?: string;
  ingest_status: string;
  chunks_indexed: number;
  active_tasks: number;
  cache_enabled: boolean;
  cache_hits: number;
  pending_docs: number;
  indexed_docs: number;
  total_docs: number;
  llm_model: string;
  llm_provider: string;
  llm_transport: string;
  llm_think_enabled: boolean;
  embedding_model: string;
  embedding_device: string;
  similarity_top_k: number;
  bm25_top_k: number;
  hybrid_top_k: number;
  reranker_enabled: boolean;
  reranker_model: string | null;
  reranker_device: string | null;
  rerank_top_k: number;
  last_ingestion: IngestionRun | null;
}

export interface IngestionRun {
  id: string;
  status: "queued" | "processing" | "done" | "error";
  phase: string;
  chunks_indexed: number;
  chunks_generated: number;
  documents_total: number;
  documents_processed: number;
  force: boolean;
  error: string | null;
  started_at: string;
  finished_at: string | null;
  queued_at: string | null;
}

export interface IngestStatusResponse {
  status: "idle" | "queued" | "processing" | "done" | "error";
  phase: string | null;
  chunks_indexed: number | null;
  chunks_generated: number | null;
  documents_total: number | null;
  documents_processed: number | null;
  error: string | null;
  run_id: string | null;
}

export interface IngestTriggerResponse {
  run_id: string;
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
  ingested: boolean;
  created_at: string;
  updated_at: string;
  suggested_by_user_id: string | null;
  suggested_by_user_name: string | null;
  suggested_by_user_slug: string | null;
}

export interface DocumentUpdateRequest {
  title?: string | null;
  authors?: string | null;
  url?: string | null;
}

export interface MetadataExtractionStatus {
  pending: number;
  running: number;
  active: number;
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
  durationMs?: number;
}

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  status: string;
  slug: string;
  locale: string;
  roles: string[];
  email_confirmed_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  about: string | null;
  link: string | null;
  avatar_url: string | null;
  approved_suggestions_count: number;
}

export interface HumanChallenge {
  challenge_id: string;
  question: string;
}

export interface DocumentSuggestion {
  id: string;
  user_id: string;
  user_name: string | null;
  status: "pending" | "approved" | "rejected";
  title: string | null;
  authors: string | null;
  url: string | null;
  user_comment: string;
  admin_comment: string | null;
  original_filename: string | null;
  file_type: string | null;
  file_size: number | null;
  document_id: string | null;
  ingested: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentSuggestionUpdate {
  title?: string | null;
  authors?: string | null;
  url?: string | null;
  user_comment?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  challenge_id: string;
  challenge_answer: string;
  locale?: string;
}

export interface ConfirmEmailRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
