import { useState, useRef, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { UploadedFile, SkippedFile } from "@/services/types";

const ALLOWED_EXTENSIONS = [".pdf", ".md"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const BATCH_SIZE = 15;

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx === -1) return "";
  return name.slice(idx).toLowerCase();
}

export function DocumentUploadPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<
    { name: string; reason: string }[]
  >([]);
  const [results, setResults] = useState<{
    uploaded: UploadedFile[];
    skipped: SkippedFile[];
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    sent: number;
    total: number;
    batch: number;
    totalBatches: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const valid: File[] = [];
    const rejected: { name: string; reason: string }[] = [];
    const selectedNames = new Set(files.map((f) => f.name.toLowerCase()));

    for (const f of arr) {
      const nameLower = f.name.toLowerCase();

      if (selectedNames.has(nameLower)) {
        rejected.push({
          name: f.name,
          reason: t("documents.rejectedDuplicate"),
        });
        continue;
      }

      const ext = getFileExtension(f.name);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        rejected.push({
          name: f.name,
          reason: ext
            ? t("documents.rejectedExtension", { ext })
            : t("documents.rejectedNoExtension"),
        });
        continue;
      }

      if (f.size === 0) {
        rejected.push({ name: f.name, reason: t("documents.rejectedEmpty") });
        continue;
      }

      if (f.size > MAX_FILE_SIZE) {
        rejected.push({
          name: f.name,
          reason: t("documents.rejectedTooLarge", {
            size: (f.size / 1024 / 1024).toFixed(1),
          }),
        });
        continue;
      }

      selectedNames.add(nameLower);
      valid.push(f);
    }

    setFiles((prev) => [...prev, ...valid]);
    setRejectedFiles((prev) => [...prev, ...rejected]);
    setResults(null);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const removeRejected = (name: string) => {
    setRejectedFiles((prev) => prev.filter((r) => r.name !== name));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0 || isUploading) return;

    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      batches.push(files.slice(i, i + BATCH_SIZE));
    }

    const accumulated: { uploaded: UploadedFile[]; skipped: SkippedFile[] } = {
      uploaded: [],
      skipped: [],
    };

    setIsUploading(true);
    setError("");
    setResults(null);

    for (let i = 0; i < batches.length; i++) {
      setUploadProgress({
        sent: i * BATCH_SIZE,
        total: files.length,
        batch: i + 1,
        totalBatches: batches.length,
      });

      try {
        const batchResult = await api.uploadDocuments(batches[i]);
        accumulated.uploaded.push(...batchResult.uploaded);
        accumulated.skipped.push(...batchResult.skipped);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Batch ${i + 1}/${batches.length} failed: ${message}`);
        setResults(accumulated);
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
    }

    setUploadProgress(null);
    setResults(accumulated);
    setFiles([]);
    setRejectedFiles([]);
    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["server-status"] });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          {t("documents.uploadTitle")}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t("documents.uploadDescription")}
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-[var(--radius-card)] border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary-50/50"
            : "border-primary-200 hover:border-primary-400"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-primary/40 mx-auto mb-4" />
        <p className="text-text-primary text-lg mb-2">
          {t("documents.dragDrop")}
        </p>
        <p className="text-text-secondary text-sm">
          {t("documents.supportedFormats")}
        </p>
        <p className="text-text-secondary/60 text-xs mt-1">
          {t("documents.extensionsNote")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.md"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {rejectedFiles.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <h2 className="font-semibold text-text-primary">
              {t("documents.rejectedTitle", { count: rejectedFiles.length })}
            </h2>
          </div>
          <div className="space-y-1">
            {rejectedFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between gap-2 py-1 text-sm"
              >
                <span className="text-text-secondary truncate">{f.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-error text-xs">{f.reason}</span>
                  <button
                    onClick={() => removeRejected(f.name)}
                    className="text-text-secondary hover:text-error p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {files.length > 0 && (
        <Card>
          <h2 className="font-semibold text-text-primary mb-3">
            {t("documents.selected", { count: files.length })}
          </h2>

          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="w-full mb-4"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress
                  ? t("documents.uploadingBatch", {
                      sent: uploadProgress.sent,
                      total: uploadProgress.total,
                      batch: uploadProgress.batch,
                      totalBatches: uploadProgress.totalBatches,
                    })
                  : t("documents.uploading")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t("documents.upload")}
              </>
            )}
          </Button>

          {isUploading && uploadProgress && (
            <div className="mb-4">
              <div className="w-full bg-primary-100 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (uploadProgress.sent / uploadProgress.total) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-1 text-center">
                {t("documents.uploadProgress", {
                  sent: uploadProgress.sent,
                  total: uploadProgress.total,
                })}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-text-primary truncate">
                    {file.name}
                  </span>
                  <span className="text-text-secondary text-sm shrink-0">
                    {formatSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                  }}
                  className="text-text-secondary hover:text-error p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {results && (
        <Card>
          <h2 className="font-semibold text-text-primary mb-3">
            <CheckCircle2 className="h-5 w-5 inline text-success mr-1" />
            {t("documents.uploadSuccess")}
          </h2>
          <div className="space-y-1 text-sm">
            {results.uploaded.map((f) => (
              <p key={f.id} className="text-text-primary">
                {f.filename}
                <Badge variant="default" className="ml-2">
                  {f.directory}
                </Badge>
              </p>
            ))}
          </div>
          {results.skipped.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-100">
              <p className="text-sm font-medium text-text-secondary mb-1">
                {t("documents.skipped")}
              </p>
              {results.skipped.map((f, i) => (
                <p key={i} className="text-sm text-text-secondary">
                  {f.filename} — {f.reason}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      {error && <Card className="text-error">{error}</Card>}
    </div>
  );
}
