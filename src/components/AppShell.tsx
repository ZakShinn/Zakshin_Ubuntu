"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("uch-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("uch-theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-72 shrink-0" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="flex-1 overflow-auto p-4 pt-16 lg:p-6 lg:pt-6">{children}</main>
    </div>
  );
}
