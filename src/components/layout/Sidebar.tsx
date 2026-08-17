import { NavLink, useNavigate } from "react-router";
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
  Lightbulb,
  Shield,
  Scale,
  Smartphone,
  Database,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const socialLinks = [
  {
    title: "Mastodon",
    href: "https://social.agroecologymap.org/@AgroecologyMap",
    viewBox: "0 0 448 512",
    path: "M433 179.1c0-97.2-63.7-125.7-63.7-125.7-62.5-28.7-228.6-28.4-290.5 0 0 0-63.7 28.5-63.7 125.7 0 115.7-6.6 259.4 105.6 289.1 41.3 10.9 76.7 13.2 105.3 11.7 51.8-2.8 80.9-18.5 80.9-18.5l-1.7-37.6s-37 11.7-78.6 10.3c-41.2-1.4-84.7-4.4-91.3-54.3a102.5 102.5 0 0 1-.9-14s40.4 9.9 91.6 12.3c31.3 1.5 60.7-1.8 90.5-5.4 57.1-6.8 106.8-41.9 113-74.1 9.8-50.7 9-119.5 9-119.5zM357 302.1h-45.5v-111c0-23.4-9.9-35.4-29.7-35.4-21.9 0-32.9 14.2-32.9 42.4v60.7h-45.2v-60.7c0-28.2-11-42.4-32.9-42.4-19.8 0-29.7 12-29.7 35.4v111H95.6V187.8c0-23.4 6-41.8 18.1-55.4 12.5-13.6 28.8-20.6 49.2-20.6 23.6 0 41.4 9.1 53.6 27.4l11.6 19.5 11.6-19.5c12.2-18.3 30-27.4 53.6-27.4 20.4 0 36.7 7 49.2 20.6 12.1 13.6 18.1 32 18.1 55.4v114.3z",
  },
];

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

              <NavLink to="/community" className={linkClass} onClick={onClose}>
                <Users className="h-4 w-4" />
                {t("nav.community")}
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

              <NavLink to="/community" className={linkClass} onClick={onClose}>
                <Users className="h-4 w-4" />
                {t("nav.community")}
              </NavLink>

              {sectionLabel(t("nav.user"))}

              <NavLink
                to="/suggestions"
                className={linkClass}
                onClick={onClose}
              >
                <Lightbulb className="h-4 w-4" />
                {t("nav.suggestions")}
              </NavLink>

              {isAdmin && (
                <>
                  {sectionLabel(t("nav.documents"))}

                  <NavLink to="/upload" className={linkClass} onClick={onClose}>
                    <Upload className="h-4 w-4" />
                    {t("nav.upload")}
                  </NavLink>

                  {sectionLabel(t("admin.section"))}
                  <NavLink
                    to="/ingestion"
                    className={linkClass}
                    onClick={onClose}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("nav.ingestion")}
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    className={linkClass}
                    onClick={onClose}
                  >
                    <Users className="h-4 w-4" />
                    {t("admin.users")}
                  </NavLink>

                  <NavLink
                    to="/admin/suggestions"
                    className={linkClass}
                    onClick={onClose}
                  >
                    <Lightbulb className="h-4 w-4" />
                    {t("admin.suggestions")}
                  </NavLink>
                </>
              )}
            </>
          ) : null}
          <div className="flex-1" />
          {sectionLabel(t("nav.about"))}
          <NavLink to="/about" className={linkClass} onClick={onClose}>
            <Info className="h-4 w-4" />
            {t("nav.about")}
          </NavLink>
          <NavLink to="/how-it-works" className={linkClass} onClick={onClose}>
            <Database className="h-4 w-4" />
            {t("nav.rag")}
          </NavLink>
          <NavLink to="/mobile" className={linkClass} onClick={onClose}>
            <Smartphone className="h-4 w-4" />
            {t("nav.mobile")}
          </NavLink>
          <NavLink to="/privacy" className={linkClass} onClick={onClose}>
            <Shield className="h-4 w-4" />
            {t("nav.privacy")}
          </NavLink>
          <NavLink to="/terms" className={linkClass} onClick={onClose}>
            <Scale className="h-4 w-4" />
            {t("nav.terms")}
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/status" className={linkClass} onClick={onClose}>
              <Activity className="h-4 w-4" />
              {t("nav.status")}
            </NavLink>
          )}

          {sectionLabel(t("nav.support"))}
          <NavLink to="/donate" className={linkClass} onClick={onClose}>
            <Heart className="h-4 w-4" />
            {t("nav.donate")}
          </NavLink>
          {sectionLabel(t("nav.social"))}
          <div className="flex flex-wrap gap-2 px-4 py-2">
            {socialLinks.map(({ title, href, path, viewBox }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={title}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <svg
                  viewBox={viewBox}
                  className="w-4 h-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </nav>

        {isAuthenticated && (
          <div className="border-t border-primary-100 p-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-base w-full text-error hover:bg-error/10 transition-colors"
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
