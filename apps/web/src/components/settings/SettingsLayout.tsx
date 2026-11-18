"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { PasswordSettingsForm } from "@/components/settings/PasswordSettingsForm";
import { useState } from "react";

interface SettingsLayoutProps {
  user?: {
    nameJa?: string | null;
    nameEn?: string | null;
    phone?: string | null;
    postalCode?: string | null;
    addressJa?: string | null;
    addressEn?: string | null;
  };
  onSuccess?: () => void;
}

export function SettingsLayout({ user, onSuccess }: SettingsLayoutProps) {
  const t = useTranslations("settings");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1>
        {lastSaved && (
          <span className="text-sm text-muted-500">
            {t("lastSaved")} {lastSaved}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm
          initial={{
            nameJa: user?.nameJa ?? "",
            nameEn: user?.nameEn ?? "",
            phone: user?.phone ?? "",
            postalCode: user?.postalCode ?? "",
            addressJa: user?.addressJa ?? "",
            addressEn: user?.addressEn ?? "",
          }}
          onSuccess={() => setLastSaved(new Date().toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit" }))}
        />
        <PasswordSettingsForm
          onSuccess={() => setLastSaved(new Date().toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit" }))}
        />
      </div>
    </div>
  );
}
