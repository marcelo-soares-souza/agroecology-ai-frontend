import { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Skeleton } from "./components/ui/Skeleton";
import { authStore } from "./stores/auth-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
});

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
