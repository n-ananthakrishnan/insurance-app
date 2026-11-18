import * as React from "react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "./VisuallyHidden";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, onChange, value, ...props }: InputProps,
    ref
  ) => {
    // Normalize so the native `<input>` receives a renderable value and a real event
    // handler. When `value` is `unknown`, fall back to a placeholder string so the input
    // never receives an invalid value.
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
    const normalizedOnChange: InputProps["onChange"] | undefined =
      onChange;
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-navy-300 bg-white py-2 pl-3 pr-8 text-sm shadow-sm ring-offset-white placeholder:text-muted-400 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-50 dark:disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500 dark:focus:ring-red-500",
            className
          )}
          ref={ref}
          value={normalizedValue}
          onChange={normalizedOnChange}
          {...props}
        />
        <VisuallyHidden>
          {props.id ? <label htmlFor={props.id}>{props.placeholder}</label> : null}
        </VisuallyHidden>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
