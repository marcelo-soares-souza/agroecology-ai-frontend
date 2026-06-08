import { Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Skeleton } from "./components/ui/Skeleton";
import { authStore } from "./stores/auth-store";
import { queryClient } from "./services/query-client";

export default function App() {
  useEffect(() => {
    authStore.restoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}
