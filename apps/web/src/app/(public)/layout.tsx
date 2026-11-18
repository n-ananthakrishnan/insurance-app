import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingAccidentButton } from "@/components/accident/FloatingAccidentButton";
import { AuthProvider } from "@/context/AuthContext";
import { CookiesProvider } from "@/components/cookies/CookiesProvider";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      <AuthProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingAccidentButton />
      </AuthProvider>
    </CookiesProvider>
  );
}

