import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { NAV_ITEMS } from "./nav";
import { AdvisorFab } from "@/features/advisor/AdvisorFab";

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const active =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    ) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar title={t(active.labelKey)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <AdvisorFab />
    </div>
  );
}
