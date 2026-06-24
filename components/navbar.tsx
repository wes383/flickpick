"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/setup", label: t.nav.setup },
    { href: "/rank", label: t.nav.rank },
    { href: "/results", label: t.nav.results },
    { href: "/community", label: t.nav.community },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/setup" className="text-lg font-semibold tracking-tight font-[family-name:var(--font-plus-jakarta-sans)]">
          {t.brand}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto px-6 pb-2 md:hidden">
        {links.map((link) => (
          <Button
            key={link.href}
            variant={pathname === link.href ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
    </header>
  );
}
