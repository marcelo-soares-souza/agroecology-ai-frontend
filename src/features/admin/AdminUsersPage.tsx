import { useQuery } from "@tanstack/react-query";
import { Trash2, Eye, User } from "lucide-react";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QueryResult } from "@/components/ui/QueryResult";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type { UserRecord } from "@/services/types";
import { useState } from "react";

export function AdminUsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const query = useQuery<UserRecord[]>({
    queryKey: ["admin-users"],
    queryFn: api.listUsers,
  });

  const deleteMutation = useAppMutation({
    mutationFn: api.deleteUser,
    invalidateKeys: [["admin-users"]],
  });

  const selectedUser = selectedUserId
    ? query.data?.find((u: UserRecord) => u.id === selectedUserId)
    : null;

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <QueryResult
            query={query}
            empty={
              <Card className="text-center py-8">
                <p className="text-text-secondary">No users found.</p>
              </Card>
            }
          >
            {(users: UserRecord[]) => (
              <div className="space-y-2">
                {users.map((user) =>
                  (() => {
                    const isAdmin = (user.roles || []).includes("admin");

                    return (
                      <Card
                        key={user.id}
                        padding="sm"
                        className={`cursor-pointer transition-colors ${
                          selectedUserId === user.id
                            ? "border-primary ring-1 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-medium text-text-primary truncate">
                                {user.full_name}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                              <span>{user.email}</span>
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {user.status}
                              </Badge>
                              {(user.roles || []).map((r: string) => (
                                <Badge
                                  key={r}
                                  variant={r === "admin" ? "default" : "info"}
                                >
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {!isAdmin && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Delete this user?")) {
                                    deleteMutation.mutate(user.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })(),
                )}
              </div>
            )}
          </QueryResult>
        </div>

        {selectedUser && (
          <Card padding="lg">
            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              User Detail
            </h2>
            <div className="space-y-4 text-base">
              <div>
                <span className="text-text-secondary block">Name</span>
                <span className="text-text-primary font-medium">
                  {selectedUser.full_name}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Email</span>
                <span className="text-text-primary">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Slug</span>
                <span className="text-text-primary">{selectedUser.slug}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Status</span>
                <Badge
                  variant={
                    selectedUser.status === "active" ? "success" : "warning"
                  }
                >
                  {selectedUser.status}
                </Badge>
              </div>
              <div>
                <span className="text-text-secondary block">Roles</span>
                <div className="flex gap-1 mt-1">
                  {(selectedUser.roles || []).map((r: string) => (
                    <Badge key={r} variant={r === "admin" ? "default" : "info"}>
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-text-secondary block">Locale</span>
                <span className="text-text-primary">{selectedUser.locale}</span>
              </div>
              <div>
                <span className="text-text-secondary block">
                  Email Confirmed
                </span>
                <span className="text-text-primary">
                  {formatDate(selectedUser.email_confirmed_at)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Last Login</span>
                <span className="text-text-primary">
                  {formatDate(selectedUser.last_login_at)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Created</span>
                <span className="text-text-primary">
                  {formatDate(selectedUser.created_at)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
