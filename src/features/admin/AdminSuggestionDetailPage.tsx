import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Pencil,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuggestionPdfViewer } from "@/components/ui/SuggestionPdfViewer";
import { getViewUrl } from "@/config/api";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusVariant: Record<
  string,
  "default" | "success" | "error" | "info" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export function AdminSuggestionDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: suggestion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-suggestion", id],
    queryFn: () => api.adminGetSuggestion(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [url, setUrl] = useState("");
  const [userComment, setUserComment] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (suggestion && !initialized) {
    setTitle(suggestion.title || "");
    setAuthors(suggestion.authors || "");
    setUrl(suggestion.url || "");
    setUserComment(suggestion.user_comment || "");
    setAdminComment(suggestion.admin_comment || "");
    setInitialized(true);
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin-suggestions"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-suggestion", id],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["my-suggestions"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["suggestion"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["documents"],
      refetchType: "all",
    });
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setActionMsg(null);
    try {
      await api.adminUpdateSuggestion(id!, {
        title: title.trim() || null,
        authors: authors.trim() || null,
        url: url.trim() || null,
        user_comment: userComment.trim() || null,
        admin_comment: adminComment.trim() || null,
      });
      setIsEditing(false);
      setActionMsg({ text: t("suggestions.updateSuccess"), type: "success" });
      invalidateAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMsg({ text: msg, type: "error" });
    }
  };

  const handleApprove = async () => {
    if (!confirm(t("admin.approveConfirm"))) return;
    setActionMsg(null);
    try {
      await api.adminApproveSuggestion(id!, {
        admin_comment: adminComment.trim() || null,
      });
      setActionMsg({ text: t("admin.approveSuccess"), type: "success" });
      invalidateAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMsg({ text: msg, type: "error" });
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) return;
    if (!confirm(t("admin.rejectConfirm"))) return;
    setActionMsg(null);
    try {
      await api.adminRejectSuggestion(id!, {
        admin_comment: rejectComment.trim(),
      });
      setActionMsg({ text: t("admin.rejectSuccess"), type: "success" });
      setShowReject(false);
      invalidateAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMsg({ text: msg, type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("admin.deleteSuggestionConfirm"))) return;
    setActionMsg(null);
    try {
      await api.adminDeleteSuggestion(id!);
      invalidateAll();
      navigate("/admin/suggestions");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMsg({ text: msg, type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="space-y-4">
        <Link to="/admin/suggestions">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <Card className="text-error text-sm">{t("suggestions.notFound")}</Card>
      </div>
    );
  }

  const isPending = suggestion.status === "pending";
  const hasPdf =
    suggestion.original_filename !== null && suggestion.file_type === "pdf";
  const approvedDocumentViewUrl =
    suggestion.status === "approved" && suggestion.document_id
      ? getViewUrl(suggestion.document_id)
      : null;
  const shouldRenderPdf =
    hasPdf &&
    (suggestion.status !== "approved" || approvedDocumentViewUrl !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Link to="/admin/suggestions" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
          {!isEditing && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          )}
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {actionMsg && (
        <Card
          padding="sm"
          className={
            actionMsg.type === "success"
              ? "text-success text-sm"
              : "text-error text-sm"
          }
        >
          {actionMsg.text}
        </Card>
      )}

      <Card>
        <form onSubmit={handleUpdate}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-8 w-8 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("documents.titleField")}
                    className="text-xl font-bold"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-text-primary break-words">
                    {suggestion.title ||
                      suggestion.url ||
                      suggestion.original_filename ||
                      suggestion.id.slice(0, 8)}
                  </h1>
                )}
                <Badge
                  variant={statusVariant[suggestion.status] || "default"}
                  className="mt-2"
                >
                  {t(`suggestions.status_${suggestion.status}`)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("admin.userId")}
                </span>
                <span className="text-text-primary text-sm">
                  {suggestion.user_name || suggestion.user_id}
                </span>
              </div>
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("documents.authorsField")}
                </span>
                {isEditing ? (
                  <Input
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                  />
                ) : (
                  <span className="text-text-primary">
                    {suggestion.authors || "—"}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("suggestions.url")}
                </span>
                {isEditing ? (
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    type="url"
                  />
                ) : suggestion.url ? (
                  <a
                    href={suggestion.url}
                    className="break-all text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {suggestion.url}
                  </a>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </div>
              <div>
                <span className="text-sm text-text-secondary block">
                  {t("suggestions.file")}
                </span>
                <span className="break-words text-text-primary">
                  {suggestion.original_filename || "—"}
                </span>
                {hasPdf && (
                  <Badge variant="info" className="ml-2">
                    PDF
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-sm text-text-secondary block">
                {t("suggestions.comment")}
              </span>
              {isEditing ? (
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  rows={3}
                  className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical mt-1"
                />
              ) : (
                <p className="text-text-primary whitespace-pre-wrap">
                  {suggestion.user_comment}
                </p>
              )}
            </div>

            <div className="border-t border-primary-100 pt-4">
              <span className="text-sm text-text-secondary block font-medium">
                {t("suggestions.adminComment")}
              </span>
              {isEditing ? (
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={2}
                  className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical mt-1"
                  placeholder={t("suggestions.noAdminComment")}
                />
              ) : (
                <p className="text-text-primary whitespace-pre-wrap mt-1">
                  {suggestion.admin_comment || t("suggestions.noAdminComment")}
                </p>
              )}
            </div>

            {shouldRenderPdf && (
              <Card padding="none" className="overflow-hidden">
                {approvedDocumentViewUrl ? (
                  <iframe
                    src={approvedDocumentViewUrl}
                    title={suggestion.original_filename ?? suggestion.id}
                    className="w-full h-[80vh] border-0"
                  />
                ) : (
                  <SuggestionPdfViewer
                    suggestionId={suggestion.id}
                    title={suggestion.original_filename ?? suggestion.id}
                  />
                )}
              </Card>
            )}

            {suggestion.document_id && (
              <div className="border-t border-primary-100 pt-4">
                <a
                  href={`/documents/${suggestion.document_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    variant="secondary"
                    type="button"
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("suggestions.documentLink")}
                  </Button>
                </a>
              </div>
            )}

            {isEditing && (
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" className="w-full sm:w-auto">
                  {t("common.save")}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(suggestion.title || "");
                    setAuthors(suggestion.authors || "");
                    setUrl(suggestion.url || "");
                    setUserComment(suggestion.user_comment || "");
                    setAdminComment(suggestion.admin_comment || "");
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Card>

      {isPending && (
        <Card>
          <h2 className="font-semibold text-text-primary mb-4">
            {t("admin.reviewActions")}
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="success"
                className="w-full sm:w-auto"
                onClick={handleApprove}
                disabled={!hasPdf}
                title={!hasPdf ? t("admin.cannotApproveNoPdf") : undefined}
              >
                <CheckCircle className="h-4 w-4" />
                {t("admin.approve")}
              </Button>
              {!hasPdf && (
                <p className="text-sm text-text-secondary self-center">
                  {t("admin.pdfRequiredToApprove")}
                </p>
              )}
            </div>

            <div className="border-t border-primary-100 pt-4">
              {showReject ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    rows={2}
                    className="w-full rounded-[var(--radius-input)] border border-primary-200 bg-white px-3 py-2 text-base text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-vertical"
                    placeholder={t("admin.rejectionReason")}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="danger"
                      className="w-full sm:w-auto"
                      onClick={handleReject}
                      disabled={!rejectComment.trim()}
                    >
                      <XCircle className="h-4 w-4" />
                      {t("admin.reject")}
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setShowReject(false);
                        setRejectComment("");
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  onClick={() => setShowReject(true)}
                >
                  <XCircle className="h-4 w-4" />
                  {t("admin.reject")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t("suggestions.created")}:{" "}
          {formatDate(suggestion.created_at, locale)}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t("suggestions.updated")}:{" "}
          {formatDate(suggestion.updated_at, locale)}
        </div>
        {suggestion.reviewed_at && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("admin.reviewed")}: {formatDate(suggestion.reviewed_at, locale)}
          </div>
        )}
      </div>
    </div>
  );
}
