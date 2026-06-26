import { useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Users, FileText, Search, RefreshCw, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import { buildApiUrl } from "@/config/api";
import type { PublicUserRecord } from "@/services/types";

const PAGE_SIZE = 50;

export function CommunityListPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [users, setUsers] = useState<PublicUserRecord[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const query = useQuery({
    queryKey: ["community-users", debouncedSearchQuery],
    queryFn: () =>
      api.listActiveUsers({
        q: debouncedSearchQuery.trim() || undefined,
        limit: PAGE_SIZE,
        offset: 0,
      }),
    placeholderData: keepPreviousData,
  });
  const totalUsers = query.data?.total ?? 0;
  const isSearchSettling = searchQuery !== debouncedSearchQuery;
  const hasMore = !isSearchSettling && users.length < totalUsers;

  useEffect(() => {
    if (query.data) {
      setUsers(query.data.data);
    }
  }, [query.data]);

  async function loadMore(): Promise<void> {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = await api.listActiveUsers({
        q: debouncedSearchQuery.trim() || undefined,
        limit: PAGE_SIZE,
        offset: users.length,
      });
      setUsers((current) => [...current, ...nextPage.data]);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-text-primary">
            <Users className="h-6 w-6 text-primary shrink-0" />
            <span className="min-w-0 break-words">{t("nav.community")}</span>
          </h1>
          <div className="flex w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                void query.refetch();
              }}
              disabled={query.isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
              />
              {t("community.refresh")}
            </Button>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {t("community.description")}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("common.search")}
          className="pl-9"
        />
      </div>

      <QueryResult
        query={query}
        empty={
          <Card className="text-center py-12">
            <Users className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
            <p className="text-text-secondary">{t("community.empty")}</p>
          </Card>
        }
      >
        {() => {
          if (users.length === 0 && totalUsers > 0) {
            return (
              <Card className="text-center py-12">
                <Search className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">{t("common.noResults")}</p>
              </Card>
            );
          }
          if (users.length === 0) {
            return (
              <Card className="text-center py-12">
                <Users className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">
                  {debouncedSearchQuery.trim()
                    ? t("common.noResults")
                    : t("community.empty")}
                </p>
              </Card>
            );
          }
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {users.map((user) => {
                  const initials =
                    user.full_name
                      .split(" ")
                      .map((word) => word[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?";

                  return (
                    <Link
                      key={user.id}
                      to={`/community/${user.slug}`}
                      className="block h-full"
                    >
                      <Card
                        padding="none"
                        className="flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-lg"
                      >
                        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-primary-50">
                          {user.avatar_url ? (
                            <img
                              src={buildApiUrl(user.avatar_url)}
                              alt={user.full_name}
                              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/70 text-5xl font-bold text-primary shadow-sm">
                              {initials}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-4 p-5">
                          <div>
                            <h3 className="text-lg font-bold leading-snug text-text-primary">
                              {user.full_name}
                            </h3>
                          </div>

                          <div className="min-h-0 flex-1">
                            {user.about && (
                              <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                                {user.about}
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-emerald-50 p-3 text-center">
                            <FileText className="mx-auto mb-0.5 h-4 w-4 text-emerald-600" />
                            <p className="text-lg font-bold text-emerald-700">
                              {user.approved_suggestions_count}
                            </p>
                            <p
                              className="text-xs text-emerald-600"
                              title={t("community.approvedSuggestionsTooltip", {
                                count: user.approved_suggestions_count,
                              })}
                            >
                              {t("community.approvedSuggestions")}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loadingMore
                      ? t("common.loadingMore")
                      : t("common.loadMore")}
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      </QueryResult>
    </div>
  );
}
