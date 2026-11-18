import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { PasswordSettingsForm } from "@/components/settings/PasswordSettingsForm";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { getTranslations } from "@/i18n/request";
import { ToastProvider } from "@/components/ui/use-toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account settings",
  description: "Manage your profile, password, and notification preferences.",
};

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1>
      <p className="mt-1 text-muted-600">{t("subtitle")}</p>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="password">{t("tabs.password")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6" forceMount>
          <ProfileSettingsForm />
        </TabsContent>
        <TabsContent value="password" className="mt-6" forceMount>
          <PasswordSettingsForm />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6" forceMount>
          <ToastProvider><NotificationSettingsForm /></ToastProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
