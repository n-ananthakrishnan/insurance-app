"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/use-toast";

const notificationSettingsSchema = z.object({
  claimStatusUpdates: z.boolean().optional(),
  policyReminders: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

export function NotificationSettingsForm() {
  const t = useTranslations("settings.notifications");
  const { enqueueToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { handleSubmit } = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      claimStatusUpdates: true,
      policyReminders: true,
      newsletter: false,
      marketing: false,
    },
  });

  // Load saved preferences if API exposes them (future enhancement)
  // For now, we use sensible defaults and allow the user to change them.
  async function onSubmit(data: NotificationSettings) {
    setSaving(true);
    startTransition(async () => {
      try {
        // In a full implementation, this would call an endpoint like
        // PATCH /customers/me/notification-preferences
        // For now, we simulate success and show a toast.
        await new Promise((r) => setTimeout(r, 300));
        setSaved(true);
        enqueueToast({
          title: t("saved"),
          description: t("savedMessage"),
          variant: "success",
        });
        setTimeout(() => setSaved(false), 2000);
      } catch {
        enqueueToast({
          title: t("error"),
          description: t("errorMessage"),
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">{t("notificationTypes.title")}</h2>

        <Toggle
          label={t("notificationTypes.claimStatusUpdates.label")}
          description={t("notificationTypes.claimStatusUpdates.description")}
          checked={true}
          onCheckedChange={() => {}}
          disabled
          className="w-full"
        />

        <Toggle
          label={t("notificationTypes.policyReminders.label")}
          description={t("notificationTypes.policyReminders.description")}
          checked={true}
          onCheckedChange={() => {}}
          disabled
          className="w-full"
        />

        <Toggle
          label={t("notificationTypes.newsletter.label")}
          description={t("notificationTypes.newsletter.description")}
          checked={false}
          onCheckedChange={() => {}}
          disabled
          className="w-full"
        />

        <Toggle
          label={t("notificationTypes.marketing.label")}
          description={t("notificationTypes.marketing.description")}
          checked={false}
          onCheckedChange={() => {}}
          disabled
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-navy-200">
        <Button type="button" variant="ghost" disabled>
          {t("disable")}
        </Button>
        <Button type="submit" variant="primary" disabled={isPending || saving}>
          {saving ? t("loading") : t("save")}
        </Button>
      </div>

      {saved && (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {t("savedStatus")}
        </p>
      )}
    </form>
  );
}
