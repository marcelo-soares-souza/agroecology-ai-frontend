import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  FileText,
  Upload,
  RefreshCw,
  Info,
  Heart,
  X,
  LogIn,
  LogOut,
  UserPlus,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, hasRestoredSession, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-base transition-colors",
      isActive
        ? "bg-primary-100 text-primary-700 font-medium"
        : "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary",
    );

  const sectionLabel = (text: string) => (
    <div className="pt-4 pb-1 px-4 text-sm font-semibold text-text-secondary/40 uppercase tracking-wider">
      {text}
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar flex flex-col transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-100">
          <button
            onClick={() => {
              navigate("/");
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt={t("app.name")} className="h-8 w-8" />
            <span className="font-semibold text-lg text-text-primary">
              {t("app.name")}
            </span>
          </button>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {hasRestoredSession && !isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  navigate("/login", { state: { from: "/" } });
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-base transition-colors w-full text-left",
                  "text-text-secondary hover:bg-sidebar-hover hover:text-text-primary",
                )}
              >
                <MessageCircle className="h-4 w-4" />
                {t("nav.home")}
              </button>

              <NavLink to="/documents" className={linkClass} onClick={onClose}>
                <FileText className="h-4 w-4" />
                {t("nav.documents")}
              </NavLink>

              <NavLink to="/login" className={linkClass} onClick={onClose}>
                <LogIn className="h-4 w-4" />
                {t("auth.login")}
              </NavLink>
              <NavLink to="/register" className={linkClass} onClick={onClose}>
                <UserPlus className="h-4 w-4" />
                {t("auth.register")}
              </NavLink>
            </>
          ) : isAuthenticated ? (
            <>
              <NavLink to="/" end className={linkClass} onClick={onClose}>
                <MessageCircle className="h-4 w-4" />
                {t("nav.home")}
              </NavLink>

              <NavLink to="/documents" className={linkClass} onClick={onClose}>
                <FileText className="h-4 w-4" />
                {t("nav.documents")}
              </NavLink>

              <NavLink to="/status" className={linkClass} onClick={onClose}>
                <Activity className="h-4 w-4" />
                {t("nav.status")}
              </NavLink>

              {isAdmin && (
                <>
                  {sectionLabel(t("nav.documents"))}

                  <NavLink to="/upload" className={linkClass} onClick={onClose}>
                    <Upload className="h-4 w-4" />
                    {t("nav.upload")}
                  </NavLink>

                  {sectionLabel(t("nav.ingestion"))}

                  <NavLink
                    to="/ingestion"
                    className={linkClass}
                    onClick={onClose}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("nav.ingestion")}
                  </NavLink>

                  {sectionLabel(t("admin.section"))}

                  <NavLink
                    to="/admin/users"
                    className={linkClass}
                    onClick={onClose}
                  >
                    <Users className="h-4 w-4" />
                    {t("admin.users")}
                  </NavLink>
                </>
              )}
            </>
          ) : null}

          <div className="flex-1" />

          <NavLink to="/donate" className={linkClass} onClick={onClose}>
            <Heart className="h-4 w-4" />
            {t("nav.donate")}
          </NavLink>

          <NavLink to="/about" className={linkClass} onClick={onClose}>
            <Info className="h-4 w-4" />
            {t("nav.about")}
          </NavLink>
        </nav>

        {isAuthenticated && (
          <div className="border-t border-primary-100 p-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-base w-full text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t("auth.logout")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
