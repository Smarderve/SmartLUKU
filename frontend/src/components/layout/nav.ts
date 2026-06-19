import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Map,
  Receipt,
  Settings,
  Activity,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/payment", labelKey: "nav.payment", icon: CreditCard },
  { to: "/monitoring", labelKey: "nav.monitoring", icon: Activity },
  { to: "/history", labelKey: "nav.history", icon: Receipt },
  { to: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/network", labelKey: "nav.network", icon: Map },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];
