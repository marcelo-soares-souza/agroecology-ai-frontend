import { type ComponentType, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/AuthGuard";
import { ChatRoute } from "./features/home/ChatRoute";
import { HomePage } from "./features/home/HomePage";

function lazyPage<T extends Record<string, ComponentType<object>>>(
  loader: () => Promise<T>,
  key: keyof T & string,
) {
  return lazy(async () => {
    const module = await loadPageModule(loader);
    return { default: module[key] as ComponentType<object> };
  });
}

async function loadPageModule<T>(loader: () => Promise<T>): Promise<T> {
  try {
    const module = await loader();
    sessionStorage.removeItem("agroecology_dynamic_import_reload");
    return module;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isDynamicImportError =
      message.includes("Failed to fetch dynamically imported module") ||
      message.includes("Importing a module script failed") ||
      message.includes("error loading dynamically imported module");

    if (
      isDynamicImportError &&
      sessionStorage.getItem("agroecology_dynamic_import_reload") !== "true"
    ) {
      sessionStorage.setItem("agroecology_dynamic_import_reload", "true");
      window.location.reload();
      return new Promise<T>(() => undefined);
    }

    throw error;
  }
}

const StatusPage = lazyPage(
  () => import("./features/status/StatusPage"),
  "StatusPage",
);
const DocumentListPage = lazyPage(
  () => import("./features/documents/DocumentListPage"),
  "DocumentListPage",
);
const DocumentDetailPage = lazyPage(
  () => import("./features/documents/DocumentDetailPage"),
  "DocumentDetailPage",
);
const DocumentEditPage = lazyPage(
  () => import("./features/documents/DocumentEditPage"),
  "DocumentEditPage",
);
const DocumentUploadPage = lazyPage(
  () => import("./features/documents/DocumentUploadPage"),
  "DocumentUploadPage",
);
const IngestionPage = lazyPage(
  () => import("./features/ingestion/IngestionPage"),
  "IngestionPage",
);
const AboutPage = lazyPage(
  () => import("./features/about/AboutPage"),
  "AboutPage",
);
const RagPage = lazyPage(() => import("./features/about/RagPage"), "RagPage");
const DonatePage = lazyPage(
  () => import("./features/donate/DonatePage"),
  "DonatePage",
);
const MobilePage = lazyPage(
  () => import("./features/mobile/MobilePage"),
  "MobilePage",
);

const PrivacyPolicyPage = lazyPage(
  () => import("./features/about/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);

const TermsOfServicePage = lazyPage(
  () => import("./features/about/TermsOfServicePage"),
  "TermsOfServicePage",
);
const LoginPage = lazyPage(
  () => import("./features/auth/LoginPage"),
  "LoginPage",
);
const RegisterPage = lazyPage(
  () => import("./features/auth/RegisterPage"),
  "RegisterPage",
);
const ConfirmEmailPage = lazyPage(
  () => import("./features/auth/ConfirmEmailPage"),
  "ConfirmEmailPage",
);
const OrcidCallbackPage = lazyPage(
  () => import("./features/auth/OrcidCallbackPage"),
  "OrcidCallbackPage",
);
const OrcidCompleteEmailPage = lazyPage(
  () => import("./features/auth/OrcidCompleteEmailPage"),
  "OrcidCompleteEmailPage",
);
const OrcidConfirmLinkPage = lazyPage(
  () => import("./features/auth/OrcidConfirmLinkPage"),
  "OrcidConfirmLinkPage",
);
const ConfirmDeleteAccountPage = lazyPage(
  () => import("./features/auth/ConfirmDeleteAccountPage"),
  "ConfirmDeleteAccountPage",
);
const AdminUsersPage = lazyPage(
  () => import("./features/admin/AdminUsersPage"),
  "AdminUsersPage",
);
const AdminSuggestionsPage = lazyPage(
  () => import("./features/admin/AdminSuggestionsPage"),
  "AdminSuggestionsPage",
);
const AdminSuggestionDetailPage = lazyPage(
  () => import("./features/admin/AdminSuggestionDetailPage"),
  "AdminSuggestionDetailPage",
);
const ForgotPasswordPage = lazyPage(
  () => import("./features/auth/ForgotPasswordPage"),
  "ForgotPasswordPage",
);
const ResetPasswordPage = lazyPage(
  () => import("./features/auth/ResetPasswordPage"),
  "ResetPasswordPage",
);
const ResendConfirmationPage = lazyPage(
  () => import("./features/auth/ResendConfirmationPage"),
  "ResendConfirmationPage",
);
const ProfilePage = lazyPage(
  () => import("./features/auth/ProfilePage"),
  "ProfilePage",
);
const SuggestionListPage = lazyPage(
  () => import("./features/suggestions/SuggestionListPage"),
  "SuggestionListPage",
);

const ProfileEditPage = lazyPage(
  () => import("./features/auth/ProfileEditPage"),
  "ProfileEditPage",
);
const SuggestionCreatePage = lazyPage(
  () => import("./features/suggestions/SuggestionCreatePage"),
  "SuggestionCreatePage",
);
const SuggestionDetailPage = lazyPage(
  () => import("./features/suggestions/SuggestionDetailPage"),
  "SuggestionDetailPage",
);
const SuggestionEditPage = lazyPage(
  () => import("./features/suggestions/SuggestionEditPage"),
  "SuggestionEditPage",
);

const CommunityListPage = lazyPage(
  () => import("./features/community/CommunityListPage"),
  "CommunityListPage",
);

const CommunityUserDetailPage = lazyPage(
  () => import("./features/community/CommunityUserDetailPage"),
  "CommunityUserDetailPage",
);

export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          handle: {
            titleKey: "landing.title",
            descriptionKey: "landing.metaDescription",
          },
        },
        {
          path: "/chat",
          element: <ChatRoute />,
          handle: {
            titleKey: "home.title",
            descriptionKey: "home.subtitle",
          },
        },
        {
          path: "/status",
          element: (
            <AuthGuard>
              <StatusPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "status.title",
            descriptionKey: "status.description",
          },
        },
        {
          path: "/suggestions",
          element: (
            <AuthGuard>
              <SuggestionListPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "suggestions.title",
            descriptionKey: "suggestions.description",
          },
        },
        {
          path: "/suggestions/new",
          element: (
            <AuthGuard>
              <SuggestionCreatePage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "suggestions.createTitle",
            descriptionKey: "suggestions.createDescription",
          },
        },
        {
          path: "/suggestions/:id",
          element: (
            <AuthGuard>
              <SuggestionDetailPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "suggestions.detailTitle",
            descriptionKey: "suggestions.description",
          },
        },
        {
          path: "/suggestions/:id/edit",
          element: (
            <AuthGuard>
              <SuggestionEditPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "suggestions.editTitle",
            descriptionKey: "suggestions.createDescription",
          },
        },
        {
          path: "/community",
          element: <CommunityListPage />,
          handle: {
            titleKey: "community.title",
            descriptionKey: "community.description",
          },
        },
        {
          path: "/community/:slug",
          element: <CommunityUserDetailPage />,
          handle: {
            titleKey: "community.detailTitle",
            descriptionKey: "community.description",
          },
        },
        {
          path: "/documents",
          element: <DocumentListPage />,
          handle: {
            titleKey: "documents.title",
            descriptionKey: "documents.listDescription",
          },
        },
        {
          path: "/documents/:id",
          element: <DocumentDetailPage />,
          handle: {
            titleKey: "documents.detailTitle",
            descriptionKey: "documents.listDescription",
          },
        },
        {
          path: "/documents/:id/edit",
          element: (
            <AuthGuard roles={["admin"]}>
              <DocumentEditPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "documents.editTitle",
          },
        },
        {
          path: "/upload",
          element: (
            <AuthGuard roles={["admin"]}>
              <DocumentUploadPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "documents.uploadTitle",
            descriptionKey: "documents.uploadDescription",
          },
        },
        {
          path: "/ingestion",
          element: (
            <AuthGuard roles={["admin"]}>
              <IngestionPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "ingestion.title",
            descriptionKey: "ingestion.description",
          },
        },
        {
          path: "/admin/users",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminUsersPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "admin.users",
            descriptionKey: "admin.usersDescription",
          },
        },
        {
          path: "/admin/suggestions",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminSuggestionsPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "admin.suggestions",
            descriptionKey: "admin.suggestionsDescription",
          },
        },
        {
          path: "/admin/suggestions/:id",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminSuggestionDetailPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "admin.suggestions",
            descriptionKey: "admin.suggestionsDescription",
          },
        },
        {
          path: "/about",
          element: <AboutPage />,
          handle: {
            titleKey: "about.title",
            descriptionKey: "about.description",
          },
        },
        {
          path: "/how-it-works",
          element: <RagPage />,
          handle: {
            titleKey: "rag.title",
            descriptionKey: "rag.metaDescription",
          },
        },
        {
          path: "/donate",
          element: <DonatePage />,
          handle: {
            titleKey: "donate.title",
            descriptionKey: "donate.metaDescription",
          },
        },
        {
          path: "/mobile",
          element: <MobilePage />,
          handle: {
            titleKey: "mobile.title",
            descriptionKey: "mobile.metaDescription",
          },
        },
        {
          path: "/privacy",
          element: <PrivacyPolicyPage />,
          handle: {
            titleKey: "privacyPolicy.title",
            descriptionKey: "privacyPolicy.metaDescription",
          },
        },
        {
          path: "/terms",
          element: <TermsOfServicePage />,
          handle: {
            titleKey: "termsOfService.title",
            descriptionKey: "termsOfService.metaDescription",
          },
        },
        {
          path: "/login",
          element: <LoginPage />,
          handle: {
            titleKey: "auth.login",
            descriptionKey: "auth.loginDescription",
          },
        },
        {
          path: "/register",
          element: <RegisterPage />,
          handle: {
            titleKey: "auth.register",
            descriptionKey: "auth.registerDescription",
          },
        },
        {
          path: "/confirm-email",
          element: <ConfirmEmailPage />,
          handle: {
            titleKey: "auth.confirmingEmail",
          },
        },
        {
          path: "/auth/orcid/callback",
          element: <OrcidCallbackPage />,
          handle: {
            titleKey: "auth.orcidCompletingTitle",
          },
        },
        {
          path: "/auth/orcid/complete-email",
          element: <OrcidCompleteEmailPage />,
          handle: {
            titleKey: "auth.orcidEmailRequiredTitle",
          },
        },
        {
          path: "/auth/orcid/confirm-link",
          element: <OrcidConfirmLinkPage />,
          handle: {
            titleKey: "auth.orcidConfirmingLink",
          },
        },
        {
          path: "/confirm-delete-account",
          element: <ConfirmDeleteAccountPage />,
          handle: {
            titleKey: "profile.deleteAccountConfirmTitle",
          },
        },
        {
          path: "/forgot-password",
          element: <ForgotPasswordPage />,
          handle: {
            titleKey: "auth.forgotPasswordTitle",
          },
        },
        {
          path: "/reset-password",
          element: <ResetPasswordPage />,
          handle: {
            titleKey: "auth.resetPassword",
          },
        },
        {
          path: "/resend-confirmation",
          element: <ResendConfirmationPage />,
          handle: {
            titleKey: "auth.resendConfirmationTitle",
          },
        },
        {
          path: "/profile/:slug",
          element: <ProfilePage />,
          handle: {
            titleKey: "profile.title",
            descriptionKey: "profile.metaDescription",
          },
        },
        {
          path: "/profile/edit",
          element: (
            <AuthGuard>
              <ProfileEditPage />
            </AuthGuard>
          ),
          handle: {
            titleKey: "profile.editTitle",
          },
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
