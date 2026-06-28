"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import clsx from "clsx";

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

  return (
    <div className="relative flex min-h-screen">
      {/* Background mesh */}
      <div
        className={clsx(
          "pointer-events-none fixed inset-0 -z-10",
          darkMode ? "bg-mesh-dark" : "bg-mesh-light"
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-surface/80 dark:bg-surface/90"
        aria-hidden
      />

      {mounted ? (
        <>
          <Sidebar darkMode={darkMode} onToggleDark={toggleDark} />
          <main className="flex-1 overflow-auto p-4 pt-20 lg:p-8 lg:pt-8">
            <div className="animate-fade-in mx-auto max-w-6xl">{children}</div>
          </main>
        </>
      ) : (
        <>
          <div className="hidden w-72 shrink-0 lg:block" />
          <main className="flex-1 p-8">{children}</main>
        </>
      )}
    </div>
  );
}
