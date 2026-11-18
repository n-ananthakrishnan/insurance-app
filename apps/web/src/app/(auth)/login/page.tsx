import { LogInForm } from "@/components/auth/LogInForm";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { getTranslations } from "@/i18n/request";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your account.",
};

export default async function LoginPage() {
  const authT = await getTranslations("auth.login");
  const authCommonT = await getTranslations("auth");

  return (
    <>
      <AuthErrorBanner />
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">{authT("title")}</h1>
          <p className="mt-2 text-muted-600">{authT("subtitle")}</p>
        </div>
        <LogInForm />
        <p className="mt-6 text-center text-sm text-muted-500">
          {authCommonT("noAccount")} {
            <a href="/register" className="text-accent-600 underline hover:text-accent-700">
              {authCommonT("registerLink")}
            </a>
          }
        </p>
      </div>
    </>
  );
}
