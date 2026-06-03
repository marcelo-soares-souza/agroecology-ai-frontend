import type { SourceChunk } from "@/services/types";

interface SourceCardProps {
  source: SourceChunk;
}

export function SourceCard({ source }: SourceCardProps) {
  const displayName = source.metadata.title
    ? `Source: ${source.metadata.title}`
    : source.metadata.source;
  const badgeColor =
    source.metadata.search_type === "vector"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="rounded-[var(--radius-input)] border border-primary-200 bg-primary-50/50 px-3 py-2 text-sm max-w-xs">
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
    </div>
  );
}
