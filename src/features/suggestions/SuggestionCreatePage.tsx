import { useState, useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, Loader2, FileText } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppMutation } from "@/hooks/use-app-mutation";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function SuggestionCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userComment, setUserComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const errorKeyMap: Record<string, string> = {
    "A suggestion with this file content already exists":
      "suggestions.errors.duplicateFile",
    "This file has already been uploaded as a document":
      "suggestions.errors.duplicateDocument",
  };

  const createMutation = useAppMutation({
    mutationFn: (formData: FormData) => api.createSuggestion(formData),
    invalidateKeys: [["my-suggestions"]],
    onSuccess: () => {
      navigate("/suggestions");
    },
  });

  const handleFileSelect = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      setClientError(t("suggestions.onlyPdf"));
      return;
    }
    if (f.size === 0) {
      setClientError("Empty file");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setClientError(
        `File exceeds 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`,
      );
      return;
    }
    setClientError(null);
    setFile(f);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!userComment.trim()) {
      setClientError(t("suggestions.commentRequired"));
      return;
    }

    if (!file) {
      setClientError(t("suggestions.fileRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("user_comment", userComment.trim());
    if (file) formData.append("file", file);

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Link to="/suggestions">
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {t("suggestions.createTitle")}
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          {t("suggestions.createDescription")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("suggestions.pdf")}
            </label>
            <div
              className="rounded-[var(--radius-card)] border-2 border-dashed p-6 text-center transition-colors cursor-pointer border-primary-200 hover:border-primary-400"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-text-primary">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-text-secondary hover:text-error p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                  <p className="text-text-primary text-sm">
                    {t("suggestions.uploadPdf")}
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t("suggestions.comment")} *
            </label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder={t("suggestions.commentPlaceholder")}
              rows={4}
              className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary placeholder:text-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
            <Link to="/suggestions">
              <Button variant="secondary" type="button">
                {t("common.cancel")}
              </Button>
            </Link>
          </div>

          {clientError && <p className="text-error text-sm">{clientError}</p>}
          {createMutation.isError && (
            <p className="text-error text-sm">
              {t(errorKeyMap[createMutation.error?.message ?? ""]) ||
                createMutation.error?.message ||
                t("common.error")}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
