import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, User, FileText } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { QueryResult } from "@/components/ui/QueryResult";
import { buildApiUrl } from "@/config/api";

export function CommunityListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["community-users"],
    queryFn: () => api.listActiveUsers(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          {t("nav.community")}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t("community.description")}
        </p>
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
        {(
          users: {
            id: string;
            full_name: string;
            slug: string;
            avatar_url: string | null;
            updated_at: string;
            approved_suggestions_count: number;
            roles: string[];
          }[],
        ) => (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users
              .filter((u) => !u.roles.includes("admin"))
              .map((user) => (
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
        )}
      </QueryResult>
    </div>
  );
}
