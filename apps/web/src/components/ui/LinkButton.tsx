import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "@/components/ui/icons/Loader2";

const variants = {
  default: "bg-white text-navy-900 border border-navy-200 hover:bg-navy-50",
  primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  secondary: "bg-navy-100 text-navy-700 hover:bg-navy-200",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  link: "text-navy-600 underline hover:text-navy-800",
  ghost: "text-navy-600 hover:bg-navy-100",
};
const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm", lg: "h-10 px-6 text-sm", xl: "h-12 px-8 text-base" };

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "default" | "primary" | "secondary" | "destructive" | "link" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, variant = "primary", size = "md", loading, className, children, ...props }, ref) => {
    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          loading && "pointer-events-none opacity-60",
          className
        )}
        aria-disabled={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Link>
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton };
