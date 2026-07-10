import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

const sourceCodeUrl = "https://codeberg.org/agroecologymap";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-primary-100 bg-sidebar text-text-secondary">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 min-[380px]:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-3 font-semibold text-text-primary">
              {t("footer.project")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/about">{t("nav.about")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/community">{t("nav.community")}</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-text-primary">
              {t("footer.knowledge")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/chat">{t("nav.home")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/how-it-works">{t("nav.rag")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/documents">{t("nav.documents")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/suggestions">
                  {t("nav.suggestions")}
                </FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-text-primary">
              {t("footer.support")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/mobile">{t("nav.mobile")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/donate">{t("nav.donate")}</FooterLink>
              </li>
              <li>
                <a
                  href={sourceCodeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 break-words text-text-secondary hover:text-text-primary"
                >
                  {t("footer.sourceCode")}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-text-primary">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/privacy">{t("nav.privacy")}</FooterLink>
              </li>
              <li>
                <FooterLink to="/terms">{t("nav.terms")}</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-100 pt-4 text-center text-sm text-text-secondary">
          <p>
            &copy; {year} {t("app.name")} - {t("footer.freeSoftware")}
          </p>
          <p className="mt-1">
            {t("footer.maintainedBy")}{" "}
            <a
              href="https://agroecologymap.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Agroecology Map
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex max-w-full break-words text-text-secondary hover:text-text-primary"
    >
      {children}
    </Link>
  );
}
