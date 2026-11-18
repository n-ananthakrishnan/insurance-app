import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "@/components/ui/icons/Loader2";

const variants = {
  default: "bg-white text-navy-900 border-navy-200 hover:bg-navy-50",
  primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
  secondary: "bg-navy-100 text-navy-700 hover:bg-navy-200",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  link: "text-navy-600 underline hover:text-navy-800",
  ghost: "text-navy-600 hover:bg-navy-100",
  outline: "border-2 border-navy-900 text-navy-900 hover:bg-navy-50",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-sm",
  xl: "h-12 px-8 text-base",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={asChild ? undefined : isDisabled}
        aria-disabled={asChild && isDisabled ? true : undefined}
        {...props}
      >
        {asChild ? children : <>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {children}
        </>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
