import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { useSimulation } from "@/store/simulation";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const PaymentPage = lazy(() => import("@/features/payment/PaymentPage"));
const MonitoringPage = lazy(() => import("@/features/monitoring/MonitoringPage"));
const HistoryPage = lazy(() => import("@/features/history/HistoryPage"));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage"));
const NetworkPage = lazy(() => import("@/features/network/NetworkPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const language = useUi((s) => s.language);
  const startSim = useSimulation((s) => s.start);
  const stopSim = useSimulation((s) => s.stop);

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    startSim();
    return () => stopSim();
  }, [startSim, stopSim]);

  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </TooltipProvider>
  );
}
