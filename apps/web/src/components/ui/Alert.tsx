"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "@/components/ui/icons";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

const variants = {
  default: "border-navy-200 bg-navy-50 text-navy-800",
  destructive: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function Alert({ className, variant = "default", children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm flex items-start gap-3",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "destructive" && <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
      {children}
    </div>
  );
}

export function AlertDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm opacity-90 flex-1", className)} {...props}>
      {children}
    </p>
  );
}
