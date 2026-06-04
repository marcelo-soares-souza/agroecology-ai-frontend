import { useState, useRef, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const uploadMutation = useMutation({
    mutationFn: (data: { files: File[] }) => api.uploadDocuments(data.files),
    onSuccess: (data) => {
      setResults(data);
      setFiles([]);
      setRejectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["server-status"] });
    },
  });

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

  const handleSubmit = () => {
    if (files.length === 0) return;
    uploadMutation.mutate({ files });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t("documents.uploadTitle")}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
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
          <div className="space-y-2 mb-4">
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

          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("documents.uploading")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t("documents.upload")}
              </>
            )}
          </Button>
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

      {uploadMutation.isError && (
        <Card className="text-error">
          {uploadMutation.error?.message || t("documents.uploadError")}
        </Card>
      )}
    </div>
  );
}
