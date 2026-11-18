import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getTranslations } from "@/i18n/request";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password?",
  description: "Send a password reset link.",
};

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgot");

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1>
        <p className="mt-2 text-muted-600">{t("subtitle")}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
