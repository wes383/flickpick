"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { getFingerprint } from "@/lib/fingerprint";
import { getUsername, setUsername } from "@/lib/storage";
import { uploadPublicList } from "@/lib/public-api";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbIds: number[];
}

export function UploadDialog({ open, onOpenChange, tmdbIds }: UploadDialogProps) {
  const { t } = useI18n();
  const [username, setUsernameState] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsernameState(getUsername() || "");
    setTurnstileToken(null);
    setHasExisting(false);

    let cancelled = false;
    (async () => {
      try {
        const fp = await getFingerprint();
        const res = await fetch(
          `/api/public/check?fingerprint=${encodeURIComponent(fp)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setHasExisting(data.exists ?? false);
      } catch (err) {
        if (!cancelled) setHasExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const canSubmit =
    username.trim().length > 0 &&
    username.trim().length <= 20 &&
    turnstileToken !== null &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !turnstileToken) return;
    setSubmitting(true);
    try {
      const fingerprint = await getFingerprint();
      await uploadPublicList({
        fingerprint,
        username: username.trim(),
        tmdbIds,
        turnstileToken,
      });
      setUsername(username.trim());
      toast.success(t.results.uploadDialog.success);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.results.uploadDialog.failed);
    } finally {
      setSubmitting(false);
    }
  };

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.results.uploadDialog.title}</DialogTitle>
          <DialogDescription>{t.results.uploadDialog.desc}</DialogDescription>
        </DialogHeader>

        {hasExisting && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-600 dark:text-yellow-500">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{t.results.uploadDialog.replaceWarning}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username">{t.results.uploadDialog.usernameLabel}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsernameState(e.target.value.slice(0, 20))}
              placeholder={t.results.uploadDialog.usernamePlaceholder}
              maxLength={20}
            />
          </div>

          {siteKey && (
            <div className="flex justify-center min-h-[65px]">
              <Turnstile
                siteKey={siteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: "auto" }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {t.results.uploadDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
