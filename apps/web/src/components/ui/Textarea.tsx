import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, error, onChange, value, ...props }: TextareaProps,
    ref
  ) => {
    const normalizedValue:
      | string
      | number
      | readonly string[]
      | undefined =
      value !== undefined
        ? typeof value === "string"
          ? value
          : typeof value === "number"
            ? value
            : Array.isArray(value)
              ? (value as readonly string[])
              : String(value)
        : props.defaultValue ?? "";
    const normalizedOnChange: TextareaProps["onChange"] | undefined =
      onChange;
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-navy-300 bg-white py-2 px-3 text-sm shadow-sm placeholder:text-muted-400 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        value={normalizedValue}
        onChange={normalizedOnChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
