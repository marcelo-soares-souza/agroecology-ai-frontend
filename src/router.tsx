import { type ComponentType, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";

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
const StatusPage = lazyPage(() => import("./features/status/StatusPage"), "StatusPage");
const DocumentListPage = lazyPage(() => import("./features/documents/DocumentListPage"), "DocumentListPage");
const DocumentDetailPage = lazyPage(() => import("./features/documents/DocumentDetailPage"), "DocumentDetailPage");
const DocumentEditPage = lazyPage(() => import("./features/documents/DocumentEditPage"), "DocumentEditPage");
const DocumentUploadPage = lazyPage(() => import("./features/documents/DocumentUploadPage"), "DocumentUploadPage");
const IngestionPage = lazyPage(() => import("./features/ingestion/IngestionPage"), "IngestionPage");
const AboutPage = lazyPage(() => import("./features/about/AboutPage"), "AboutPage");

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/status", element: <StatusPage /> },
      { path: "/documents", element: <DocumentListPage /> },
      { path: "/documents/:id", element: <DocumentDetailPage /> },
      { path: "/documents/:id/edit", element: <DocumentEditPage /> },
      { path: "/upload", element: <DocumentUploadPage /> },
      { path: "/ingestion", element: <IngestionPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
