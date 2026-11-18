import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@radix-ui/react-switch";

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  error?: boolean;
  label?: string;
  description?: string;
}

const Toggle = React.forwardRef<React.ElementRef<typeof Switch>, ToggleProps>(
  ({ className, error, label, description, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <Switch
            ref={ref}
            className={cn(
              "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent-500 data-[state=unchecked]:bg-navy-300 dark:focus-visible:ring-offset-gray-950 dark:focus-visible:ring-gray-50 dark:data-[state=checked]:bg-accent-400 dark:data-[state=unchecked]:bg-gray-600",
              error && "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-red-300",
              className
            )}
            {...props}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition translate-x-0.5",
                "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5"
              )}
            />
          </Switch>
        </div>
        {(label || description) && <span className="text-sm text-navy-700">{label}{description && <span className="block text-xs text-muted-500">{description}</span>}</span>}
      </div>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
