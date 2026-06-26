import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageMeta } from "@/components/PageMeta";
import { CookieConsent } from "@/components/CookieConsent";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background">
      <PageMeta />
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 pb-24 md:p-6 lg:p-2">
        <Outlet />
      </main>
      <CookieConsent />
    </div>
  );
}
