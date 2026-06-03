import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { User, Mail, Calendar, Clock, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { Button } from "@/components/ui/Button";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: ["user-profile", slug],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/api/v1/auth/users/by-slug/${slug}`,
      ).then((r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error("User not found");
          throw new Error("Failed to load profile");
        }
        return r.json();
      }),
    enabled: !!slug,
  });

  return (
    <div className="space-y-6">
      <Link to="/">
        <Button variant="ghost">← Back</Button>
      </Link>

      <QueryResult
        query={query}
        skeleton={
          <Card>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 bg-primary-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-primary-100 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        }
      >
        {(profile) => (
          <Card>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {(profile as { full_name?: string }).full_name ||
                      (profile as { email?: string }).email}
                  </h1>
                  <p className="text-text-secondary">
                    @{(profile as { slug?: string }).slug}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(profile as { status?: string }).status === "active" ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="warning">
                    {(profile as { status?: string }).status}
                  </Badge>
                )}
                {((profile as { roles?: string[] }).roles || []).map(
                  (r: string) => (
                    <Badge key={r} variant={r === "admin" ? "default" : "info"}>
                      {r}
                    </Badge>
                  ),
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 border-t border-primary-100 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">Email:</span>
                  <span className="text-text-primary">
                    {(profile as { email?: string }).email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">Locale:</span>
                  <span className="text-text-primary">
                    {(profile as { locale?: string }).locale}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">Joined:</span>
                  <span className="text-text-primary">
                    {formatDate(
                      (profile as { created_at?: string }).created_at || null,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">Last login:</span>
                  <span className="text-text-primary">
                    {formatDate(
                      (profile as { last_login_at?: string }).last_login_at ||
                        null,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </QueryResult>
    </div>
  );
}
