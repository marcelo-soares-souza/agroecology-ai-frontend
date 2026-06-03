import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LogOut, User } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, session, logout, hasRestoredSession } = useAuth();

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-gray-200 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="text-text-primary hover:text-primary p-1 -ml-1"
      >
        <Menu className="h-6 w-6" />
      </button>

      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <img src="/logo.png" alt={t("app.name")} className="h-7 w-7 max-sm:hidden" />
        <span className="font-semibold text-primary hidden sm:inline">
          {t("app.name")}
        </span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <LanguageSelector />

        {hasRestoredSession && isAuthenticated && session ? (
          <>
            <button
              onClick={() => navigate(`/profile/${session.userId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-primary rounded-xl hover:bg-primary-50 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{session.fullName || session.email}</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-error hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : hasRestoredSession ? (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 text-sm bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Sign In
          </button>
        ) : null}
      </div>
    </header>
  );
}
