import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-gray-200 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="text-text-primary hover:text-primary p-1 -ml-1"
      >
        <Menu className="h-6 w-6" />
      </button>

      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt={t("app.name")}
          className="h-7 w-7 max-sm:hidden"
        />
        <span className="font-semibold text-primary hidden sm:inline">
          {t("app.name")}
        </span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <LanguageSelector />
      </div>
    </header>
  );
}
