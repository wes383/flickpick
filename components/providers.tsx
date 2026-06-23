"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        {children}
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}
