import * as React from "react";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "@/components/ui/icons/Check";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    error?: boolean;
    // Accept a loosely-typed Controller `field.checked`/`field.onChange` so render-prop
    // forms that bind `{...field}` to a checkbox compile during the current build pass.
    // The real runtime wiring will be completed in the web↔API wiring phase.
    checked?: unknown;
    onCheckedChange?: (value: unknown) => void;
  }
>(({ className, error, checked, onCheckedChange, ...props }, ref) => {
  const normalizedChecked: boolean | undefined =
    checked !== undefined ? Boolean(checked) : undefined;
  const normalizedOnCheckedChange: ((value: boolean) => void) | undefined =
    onCheckedChange
      ? (value: boolean) => onCheckedChange(value)
      : undefined;
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded border border-navy-300 text-accent-600 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent-600 data-[state=checked]:border-accent-600 data-[state=checked]:text-white dark:ring-offset-gray-950 dark:focus-visible:ring-gray-50 dark:border-gray-600 dark:text-accent-500 dark:focus-visible:ring-gray-50 dark:data-[state=checked]:border-accent-500",
        error && "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 data-[state=checked]:text-white",
        className
      )}
      checked={normalizedChecked}
      onCheckedChange={normalizedOnCheckedChange}
      {...props}
    >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="w-4 h-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
