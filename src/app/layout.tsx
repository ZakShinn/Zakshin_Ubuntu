import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ubuntu Command Helper",
  description:
    "Công cụ sinh lệnh cấu hình Ubuntu Server: firewall, SSH, Docker, Nginx, SSL, Node.js, MongoDB và nhiều hơn nữa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
