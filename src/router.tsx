import { type ComponentType, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/AuthGuard";
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
const DonatePage = lazyPage(
  () => import("./features/donate/DonatePage"),
  "DonatePage",
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
        },
        {
          path: "/status",
          element: (
            <AuthGuard>
              <StatusPage />
            </AuthGuard>
          ),
        },
        {
          path: "/suggestions",
          element: (
            <AuthGuard>
              <SuggestionListPage />
            </AuthGuard>
          ),
        },
        {
          path: "/suggestions/new",
          element: (
            <AuthGuard>
              <SuggestionCreatePage />
            </AuthGuard>
          ),
        },
        {
          path: "/suggestions/:id",
          element: (
            <AuthGuard>
              <SuggestionDetailPage />
            </AuthGuard>
          ),
        },
        {
          path: "/suggestions/:id/edit",
          element: (
            <AuthGuard>
              <SuggestionEditPage />
            </AuthGuard>
          ),
        },
        {
          path: "/community",
          element: <CommunityListPage />,
        },
        {
          path: "/community/:slug",
          element: <CommunityUserDetailPage />,
        },
        {
          path: "/documents",
          element: <DocumentListPage />,
        },
        {
          path: "/documents/:id",
          element: <DocumentDetailPage />,
        },
        {
          path: "/documents/:id/edit",
          element: (
            <AuthGuard roles={["admin"]}>
              <DocumentEditPage />
            </AuthGuard>
          ),
        },
        {
          path: "/upload",
          element: (
            <AuthGuard roles={["admin"]}>
              <DocumentUploadPage />
            </AuthGuard>
          ),
        },
        {
          path: "/ingestion",
          element: (
            <AuthGuard roles={["admin"]}>
              <IngestionPage />
            </AuthGuard>
          ),
        },
        {
          path: "/admin/users",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminUsersPage />
            </AuthGuard>
          ),
        },
        {
          path: "/admin/suggestions",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminSuggestionsPage />
            </AuthGuard>
          ),
        },
        {
          path: "/admin/suggestions/:id",
          element: (
            <AuthGuard roles={["admin"]}>
              <AdminSuggestionDetailPage />
            </AuthGuard>
          ),
        },
        { path: "/about", element: <AboutPage /> },
        { path: "/donate", element: <DonatePage /> },
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
        { path: "/confirm-email", element: <ConfirmEmailPage /> },
        { path: "/forgot-password", element: <ForgotPasswordPage /> },
        { path: "/reset-password", element: <ResetPasswordPage /> },
        { path: "/resend-confirmation", element: <ResendConfirmationPage /> },
        { path: "/profile/:slug", element: <ProfilePage /> },
        {
          path: "/profile/edit",
          element: (
            <AuthGuard>
              <ProfileEditPage />
            </AuthGuard>
          ),
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
