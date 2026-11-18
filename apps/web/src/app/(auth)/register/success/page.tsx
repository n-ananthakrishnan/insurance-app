import { getTranslations } from "@/i18n/request";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Registration complete",
};

export default async function RegisterSuccessPage() {
  const t = await getTranslations("auth.register");

  return (
    <div className="w-full max-w-sm mx-auto text-center py-16">
      <div className="rounded-full bg-green-100 p-4 mb-6 inline-block">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2">{t("successTitle")}</h1>
      <p className="text-muted-600 mb-6">{t("successMessage")}</p>
      <Button asChild variant="primary">
        <a href="/login">{t("backToLogin")}</a>
      </Button>
    </div>
  );
}
