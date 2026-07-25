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
  {
    title: "Instagram",
    href: "https://www.instagram.com/agroecologymap/",
    viewBox: "0 0 24 24",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/people/Agroecology-Map/61584946380130/",
    viewBox: "0 0 24 24",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/agroecologymap",
    viewBox: "0 0 24 24",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    title: "Bluesky",
    href: "https://bsky.app/profile/agroecologymap.bsky.social",
    viewBox: "0 0 576 512",
    path: "M407.8 294.7c-3.3-.4-6.7-.8-10-1.3 3.4.4 6.7.9 10 1.3zM288 227.1C261.9 176.4 190.9 81.9 124.9 35.3 61.6-9.4 37.5 1.7 21.6 10.5 3.3 20.6 0 52.5 0 71.5c0 19.1 10.5 154.8 17.4 177.6 22.3 74.7 102.6 99.4 175.1 91.9-87.8 13.1-165 45.9-63.5 158.2 111.8 115.3 153.2-24.4 159-95.7 5.8 71.3 47.2 211 159 95.7 101.5-112.3 24.3-145.1-63.5-158.2 72.5 7.5 152.8-17.3 175.1-91.9 6.9-22.8 17.4-158.5 17.4-177.6 0-19-3.3-50.9-21.6-61C538.5 1.7 514.4-9.4 451.1 35.3 385.1 81.9 314.1 176.4 288 227.1z",
  },
  {
    title: "YouTube",
    href: "https://www.youtube.com/@AgroecologyMap",
    viewBox: "0 0 24 24",
    path: "M19.615 3.184C16.011 2.938 7.984 2.938 4.38 3.184c-3.764.246-4.57 1.561-4.639 4.816-.069 3.255-.069 4.745 0 8 .069 3.255.875 4.57 4.639 4.816 3.604.246 11.631.246 15.236 0 3.764-.246 4.57-1.561 4.639-4.816.069-3.255.069-4.745 0-8-.069-3.255-.875-4.57-4.639-4.816zM9.75 15.568V8.432L15.818 12 9.75 15.568z",
  },
  {
    title: "Patreon",
    href: "https://www.patreon.com/c/agroecologymap",
    viewBox: "0 0 512 512",
    path: "M489.7 153.8c-.1-65.4-51-119-110.7-138.3C304.8-8.5 207-5 136.1 28.4 50.3 68.9 23.3 157.7 22.3 246.2 21.5 319 28.7 510.6 136.9 512c80.3 1 92.3-102.5 129.5-152.3 26.4-35.5 60.5-45.5 102.4-55.9 72-17.8 121.1-74.7 120.9-150z",
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
