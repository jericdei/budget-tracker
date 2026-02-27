import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Track income, plan your budget, and manage expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} overflow-x-hidden font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/30">
          <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
              <h1 className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200">
                Budget Tracker
              </h1>
              <AppNav />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
