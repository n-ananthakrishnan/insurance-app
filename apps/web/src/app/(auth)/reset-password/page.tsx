import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getTranslations } from "@/i18n/request";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("auth.reset");

  if (!token) {
    return (
      <div className="w-full max-w-sm mx-auto text-center py-12">
        <p className="text-muted-500">{t("missingTokenMessage")}</p>
        <a href="/forgot-password" className="text-accent-600 underline hover:text-accent-700 mt-2 inline-block">
          {t("requestNewLink")}
        </a>
      </div>
    );
  }

  return <div className="w-full max-w-sm mx-auto"><div className="text-center mb-8"><h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1><p className="mt-2 text-muted-600">{t("subtitle")}</p></div><ResetPasswordForm token={token} /></div>;
}
