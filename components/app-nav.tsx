"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, PiggyBank, Receipt, LayoutDashboard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/transactions", label: "Transactions", icon: Receipt },
];

function NavLinks({
  onClick,
  variant = "desktop",
}: {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const isDesktop = variant === "desktop";
  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium transition-colors",
              isDesktop
                ? "px-4 py-2"
                : "px-4 py-3",
              isDesktop && isActive
                ? "bg-background text-foreground shadow-sm"
                : isDesktop
                  ? "text-muted-foreground hover:text-foreground"
                  : isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: Hamburger menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 px-0 sm:hidden">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            <NavLinks variant="mobile" onClick={() => setOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop: Full nav */}
      <nav className="hidden rounded-lg bg-muted/60 p-1 sm:flex">
        <NavLinks />
      </nav>
    </>
  );
}
