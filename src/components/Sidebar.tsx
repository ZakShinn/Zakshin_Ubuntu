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
} from "lucide-react";
import { tools, categoryLabels, searchTools } from "@/lib/tools";
import clsx from "clsx";

const categoryIcons: Record<string, ReactNode> = {
  firewall: <Flame className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  docker: <Container className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  system: <Server className="h-4 w-4" />,
  network: <Network className="h-4 w-4" />,
  backup: <Archive className="h-4 w-4" />,
};

interface SidebarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Sidebar({ darkMode, onToggleDark }: SidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const sidebarContent = (
    <>
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ubuntu-orange text-white font-bold text-sm">
            UCH
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Ubuntu Command Helper</p>
            <p className="text-xs text-gray-500">Sinh lệnh VPS</p>
          </div>
        </Link>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm: iptables, docker, nginx..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={clsx(
            "mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm",
            pathname === "/"
              ? "bg-ubuntu-orange/10 text-ubuntu-orange font-medium"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
        >
          <Home className="h-4 w-4" />
          Trang chủ
        </Link>

        <Link
          href="/profiles"
          onClick={() => setMobileOpen(false)}
          className={clsx(
            "mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm",
            pathname === "/profiles"
              ? "bg-ubuntu-orange/10 text-ubuntu-orange font-medium"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
        >
          <Server className="h-4 w-4" />
          Hồ sơ server
        </Link>

        <Link
          href="/history"
          onClick={() => setMobileOpen(false)}
          className={clsx(
            "mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm",
            pathname === "/history"
              ? "bg-ubuntu-orange/10 text-ubuntu-orange font-medium"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
        >
          <Archive className="h-4 w-4" />
          Lịch sử
        </Link>

        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category} className="mb-3">
            <p className="mb-1 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {categoryIcons[category]}
              {categoryLabels[category] || category}
            </p>
            {categoryTools.map((t) => (
              <Link
                key={t.definition.id}
                href={`/tools/${t.definition.id}`}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "block rounded-md px-3 py-1.5 text-sm",
                  pathname === `/tools/${t.definition.id}`
                    ? "bg-ubuntu-orange/10 text-ubuntu-orange font-medium"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                {t.definition.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <button
          type="button"
          onClick={onToggleDark}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? "Sáng" : "Tối"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md bg-white p-2 shadow-md lg:hidden dark:bg-gray-800"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform dark:bg-gray-900 lg:static lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 lg:hidden"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
