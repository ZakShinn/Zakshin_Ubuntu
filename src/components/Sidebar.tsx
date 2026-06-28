"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  Search,
  Home,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
  Flame,
  Container,
  Globe,
  Database,
  Server,
  Network,
  Archive,
  ChevronDown,
  Sparkles,
  History,
  LayoutTemplate,
  Terminal,
} from "lucide-react";
import { tools, categoryLabels, searchTools } from "@/lib/tools";
import clsx from "clsx";

const categoryIcons: Record<string, ReactNode> = {
  firewall: <Flame className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
  docker: <Container className="h-3.5 w-3.5" />,
  web: <Globe className="h-3.5 w-3.5" />,
  database: <Database className="h-3.5 w-3.5" />,
  system: <Server className="h-3.5 w-3.5" />,
  network: <Network className="h-3.5 w-3.5" />,
  backup: <Archive className="h-3.5 w-3.5" />,
};

const mainLinks = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/profiles", label: "Hồ sơ server", icon: LayoutTemplate },
  { href: "/history", label: "Lịch sử", icon: History },
];

interface SidebarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Sidebar({ darkMode, onToggleDark }: SidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const filteredTools = useMemo(() => searchTools(search), [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof tools> = {};
    for (const t of filteredTools) {
      const cat = t.definition.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [filteredTools]);

  function toggleCategory(cat: string) {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="border-b border-border/60 p-5">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ubuntu-orange to-ubuntu-orange-light shadow-glow transition-transform group-hover:scale-105">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-content">Ubuntu Command</p>
            <p className="flex items-center gap-1 text-xs text-content-faint">
              <Sparkles className="h-3 w-3 text-ubuntu-orange" />
              Helper
            </p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="iptables, docker, nginx..."
            className="input-modern pl-10 py-2"
          />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-4 space-y-0.5">
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(href)
                  ? "bg-ubuntu-orange/10 text-ubuntu-orange shadow-sm"
                  : "text-content-muted hover:bg-surface-muted hover:text-content"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* Tool categories */}
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-content-faint">
          Công cụ
        </p>

        {Object.entries(grouped).map(([category, categoryTools]) => {
          const collapsed = collapsedCats[category] && !search;
          return (
            <div key={category} className="mb-2">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-content-muted transition-colors hover:text-content"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-surface-muted text-ubuntu-orange">
                  {categoryIcons[category]}
                </span>
                <span className="flex-1 text-left">{categoryLabels[category] || category}</span>
                <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-content-faint">
                  {categoryTools.length}
                </span>
                <ChevronDown
                  className={clsx(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    collapsed && "-rotate-90"
                  )}
                />
              </button>

              {!collapsed && (
                <div className="mt-0.5 space-y-0.5 pl-2">
                  {categoryTools.map((t) => (
                    <Link
                      key={t.definition.id}
                      href={`/tools/${t.definition.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                        pathname === `/tools/${t.definition.id}`
                          ? "bg-ubuntu-orange/10 font-medium text-ubuntu-orange"
                          : "text-content-muted hover:bg-surface-muted hover:text-content"
                      )}
                    >
                      {t.definition.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-3">
        <button
          type="button"
          onClick={onToggleDark}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-content-muted transition-all hover:bg-surface-muted hover:text-content"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </span>
          {darkMode ? "Chế độ sáng" : "Chế độ tối"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="glass-strong fixed left-4 top-4 z-40 rounded-xl p-2.5 shadow-card lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5 text-content" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "glass-strong fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col shadow-card transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-content-muted hover:bg-surface-muted lg:hidden"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
