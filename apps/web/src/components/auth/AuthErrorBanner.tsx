"use client";

import { AlertCircle } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/Alert";

interface AuthErrorBannerProps {
  error?: string | null;
}

export function AuthErrorBanner({ error }: AuthErrorBannerProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
