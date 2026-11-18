import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { getTranslations } from "@/i18n/request";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a new account.",
};

export default async function RegisterPage() {
  const authT = await getTranslations("auth.register");
  const authCommonT = await getTranslations("auth");

  return (
    <>
      <AuthErrorBanner />
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">{authT("title")}</h1>
          <p className="mt-2 text-muted-600">{authT("subtitle")}</p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-500">
          {authCommonT("alreadyHaveAccount")} {
            <a href="/login" className="text-accent-600 underline hover:text-accent-700">
              {authCommonT("loginLink")}
            </a>
          }
        </p>
      </div>
    </>
  );
}
