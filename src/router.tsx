import { type ComponentType, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/AuthGuard";

function lazyPage<T extends Record<string, ComponentType<object>>>(
  loader: () => Promise<T>,
  key: keyof T & string,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[key] as ComponentType<object> };
  });
}

const HomePage = lazyPage(() => import("./features/home/HomePage"), "HomePage");
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
        { path: "/about", element: <AboutPage /> },
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
        { path: "/confirm-email", element: <ConfirmEmailPage /> },
        { path: "/forgot-password", element: <ForgotPasswordPage /> },
        { path: "/reset-password", element: <ResetPasswordPage /> },
        { path: "/resend-confirmation", element: <ResendConfirmationPage /> },
        { path: "/profile/:slug", element: <ProfilePage /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
