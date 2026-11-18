import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <AuthProvider>
        <AuthErrorBanner />
        {children}
      </AuthProvider>
    </div>
  );
}

