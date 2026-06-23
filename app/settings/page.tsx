"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, X, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "next-themes";
import { clearSession } from "@/lib/storage";
import { toast } from "sonner";
import type { Language } from "@/types";

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/tmdb/genres")
      .then((res) => setApiConfigured(res.ok))
      .catch(() => setApiConfigured(false));
  }, []);

  const handleClearData = () => {
    if (!confirm(t.settings.clearDataConfirm)) return;
    clearSession();
    toast.success(language === "zh" ? "数据已清除" : "Data cleared");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-medium tracking-tight mb-8">
          {t.settings.title}
        </h1>

        <div className="space-y-6">
          {/* Language */}
          <Card className="p-5 space-y-3">
            <div>
              <h2 className="font-medium">{t.settings.language}</h2>
            </div>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Theme */}
          <Card className="p-5 space-y-3">
            <div>
              <h2 className="font-medium">{t.settings.theme}</h2>
            </div>
            <Select
              value={theme || "system"}
              onValueChange={(v) => setTheme(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t.settings.light}</SelectItem>
                <SelectItem value="dark">{t.settings.dark}</SelectItem>
                <SelectItem value="system">{t.settings.system}</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* API Status */}
          <Card className="p-5 space-y-3">
            <div>
              <h2 className="font-medium">{t.settings.apiStatus}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {apiConfigured === null ? (
                <span className="text-muted-foreground">
                  {t.common.loading}
                </span>
              ) : apiConfigured ? (
                <>
                  <Check className="size-4 text-green-500" />
                  <span>{t.settings.apiConfigured}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-destructive" />
                  <span>{t.settings.apiNotConfigured}</span>
                </>
              )}
            </div>
          </Card>

          {/* Clear Data */}
          <Card className="p-5 space-y-3 border-destructive/30">
            <div>
              <h2 className="font-medium">{t.settings.clearData}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.settings.clearDataDesc}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearData}
            >
              <Trash2 className="size-4" />
              {t.settings.clearData}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
