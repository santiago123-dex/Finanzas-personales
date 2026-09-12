import {
  LayoutDashboard,
  ArrowRightLeft,
  Tag,
  BarChart3,
  Plus,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowRightLeft },
  { href: "/transactions/new", label: "Nuevo", icon: Plus, primary: true },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/summary", label: "Resumen", icon: BarChart3 },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
