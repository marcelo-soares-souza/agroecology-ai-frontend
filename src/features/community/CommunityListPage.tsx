import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Users, User, FileText, Search, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QueryResult } from "@/components/ui/QueryResult";
import { buildApiUrl } from "@/config/api";

export function CommunityListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const query = useQuery({
    queryKey: ["community-users"],
    queryFn: () => api.listActiveUsers(),
  });

  const filteredUsers = useMemo(
    () =>
      query.data?.filter((user) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return user.full_name?.toLowerCase().includes(q);
      }),
    [query.data, searchQuery],
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users className="h-6 w-6 text-primary shrink-0" />
            {t("nav.community")}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
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
          const users = filteredUsers ?? [];
          if (users.length === 0 && (query.data?.length ?? 0) > 0) {
            return (
              <Card className="text-center py-12">
                <Search className="h-12 w-12 text-text-secondary/40 mx-auto mb-3" />
                <p className="text-text-secondary">{t("common.noResults")}</p>
              </Card>
            );
          }
          return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card
                  key={user.id}
                  padding="sm"
                  className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/community/${user.slug}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={buildApiUrl(
                            user.avatar_url +
                              (user.updated_at
                                ? `?v=${encodeURIComponent(user.updated_at)}`
                                : ""),
                          )}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-text-primary truncate min-w-0">
                      {user.full_name}
                    </span>
                    {user.approved_suggestions_count > 0 && (
                      <span
                        className="ml-auto flex items-center gap-1 text-xs text-text-secondary shrink-0"
                        title={t("community.approvedSuggestionsTooltip", {
                          count: user.approved_suggestions_count,
                        })}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {user.approved_suggestions_count}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </QueryResult>
    </div>
  );
}
