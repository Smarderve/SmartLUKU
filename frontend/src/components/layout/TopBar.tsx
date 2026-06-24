import { useTranslation } from "react-i18next";
import { Languages, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsMenu } from "./NotificationsMenu";
import { useUi } from "@/store/ui";
import { useAuth } from "@/store/auth";

function initials(name?: string) {
  if (!name) return "SL";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar({ title }: { title: string }) {
  const { t } = useTranslation();
  const theme = useUi((s) => s.theme);
  const toggleTheme = useUi((s) => s.toggleTheme);
  const language = useUi((s) => s.language);
  const setLanguage = useUi((s) => s.setLanguage);
  const setSidebarOpen = useUi((s) => s.setSidebarOpen);
  const profile = useAuth((s) => s.profile);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="flex-1 truncate text-lg font-bold tracking-tight">{title}</h1>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 font-semibold"
        onClick={() => setLanguage(language === "sw" ? "en" : "sw")}
        aria-label={t("settings.language")}
      >
        <Languages className="h-4 w-4" />
        <span className="uppercase">{language}</span>
      </Button>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("settings.theme")}>
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <NotificationsMenu />

      <Avatar>
        <AvatarFallback>{initials(profile?.fullName ?? profile?.firstName)}</AvatarFallback>
      </Avatar>
    </header>
  );
}
