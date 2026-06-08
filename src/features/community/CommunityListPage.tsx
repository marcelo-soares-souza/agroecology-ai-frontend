import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { QueryResult } from "@/components/ui/QueryResult";

export function CommunityListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["community-users"],
    queryFn: () => api.listActiveUsers(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">
          {t("nav.community")}
        </h1>
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
        {(users: { id: string; full_name: string; slug: string }[]) => (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card
                key={user.id}
                padding="sm"
                className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/community/${user.slug}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-text-primary truncate">
                    {user.full_name}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </QueryResult>
    </div>
  );
}
