import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "agroecology_storage_notice_acknowledged";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const acknowledge = () => {
    localStorage.setItem(STORAGE_KEY, "acknowledged");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary-100 shadow-lg p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("consent.message")}{" "}
            <Link
              to="/privacy"
              className="text-primary hover:underline"
              onClick={() => setVisible(false)}
            >
              {t("nav.privacy")}
            </Link>{" "}
            {t("consent.and")}{" "}
            <Link
              to="/terms"
              className="text-primary hover:underline"
              onClick={() => setVisible(false)}
            >
              {t("nav.terms")}
            </Link>
          </p>
        </div>
        <div className="flex w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={acknowledge}
          >
            {t("consent.acknowledge")}
          </Button>
        </div>
      </div>
    </div>
  );
}
