import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

interface QueryResultProps<TData> {
  query: UseQueryResult<TData, Error>;
  skeleton?: ReactNode;
  error?: ReactNode;
  empty?: ReactNode;
  children: (data: TData) => ReactNode;
  isEmpty?: (data: TData) => boolean;
}

export function QueryResult<TData>({
  query,
  skeleton,
  error,
  empty,
  children,
  isEmpty,
}: QueryResultProps<TData>) {
  const { t } = useTranslation();
  if (query.isLoading) {
    return (
      skeleton ?? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )
    );
  }

  if (query.isError) {
    return (
      error ?? (
        <Card className="text-error text-sm">
          {query.error?.message ?? t("common.errorOccurred")}
        </Card>
      )
    );
  }

  if (query.data === undefined || query.data === null) {
    return empty ?? null;
  }

  const check =
    isEmpty ??
    ((d: TData) => {
      if (Array.isArray(d)) return d.length === 0;
      return false;
    });

  if (check(query.data)) {
    return empty ?? null;
  }

  return <>{children(query.data)}</>;
}
