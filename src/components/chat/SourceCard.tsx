import type { SourceChunk } from "@/services/types";

interface SourceCardProps {
  source: SourceChunk;
}

function extractDocumentId(source: SourceChunk): string | null {
  if (source.metadata.document_id) {
    return source.metadata.document_id;
  }
  const parts = source.metadata.source.split("/");
  const filename = parts[parts.length - 1] || "";
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex > 0) {
    return filename.substring(0, dotIndex);
  }
  return filename || null;
}

export function SourceCard({ source }: SourceCardProps) {
  const displayName = source.metadata.title
    ? `Source: ${source.metadata.title}`
    : source.metadata.source;
  const badgeColor =
    source.metadata.search_type === "vector"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  const documentId = extractDocumentId(source);

  const baseClasses =
    "rounded-[var(--radius-input)] border border-primary-200 bg-primary-50/50 px-3 py-2 text-sm max-w-xs";

  const linkClasses = documentId
    ? "block hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-primary-100/80 transition-all duration-200 cursor-pointer"
    : "";

  const inner = (
    <>
      <p className="text-text-primary line-clamp-3 mb-1">{source.text}</p>
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="truncate">{displayName}</span>
        <span
          className={`rounded-full px-1.5 py-0.5 font-medium ${badgeColor}`}
        >
          {source.metadata.search_type}
        </span>
        <span className="text-primary-600 font-medium">
          {(source.score * 100).toFixed(0)}%
        </span>
      </div>
    </>
  );

  if (documentId) {
    return (
      <a
        href={`${import.meta.env.BASE_URL}documents/${documentId}`.replace(
          /\/+/g,
          "/",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${linkClasses}`}
      >
        {inner}
      </a>
    );
  }

  return <div className={baseClasses}>{inner}</div>;
}
