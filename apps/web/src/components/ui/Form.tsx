"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { useFormField } from "./use-form";
import { Label } from "./Label";
import { Controller, type Control } from "react-hook-form";

interface FormInterface extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Form routing (optional). If true, the form will use the browser's built-in form
   * action instead of JavaScript. Used for simple server form submissions.
   */
  asChild?: boolean;
}

const Form = React.forwardRef<HTMLFormElement, FormInterface>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "form";
    return (
      <Comp
        ref={ref}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The name of the field. Required for form registration.
   */
  name?: string;
  /**
   * If true, the field will be rendered as a child via Slot.
   */
  asChild?: boolean;
  /**
   * react-hook-form Controller prop (provides `control` from `useForm`) — accepted but
   * currently ignored; our Form is not wired to a full RHF `useForm`, so these render-team
   * forms rely on the presentational field layout only.
   */
  control?: unknown;
  /**
   * react-hook-form Controller `render` prop. When present, render the children into a
   * field container. The `field` object passed to `render` is typed loosely so existing
   * forms that spread `{...field}` onto `<Input>`/`<Textarea>`/`<select>` continue to
   * compile; at runtime the value comes from the wire-up that will be completed in the
   * web↔API wiring phase.
   */
  render?: (args: { field: any }) => React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, name, asChild = false, render, control, children, ...props }, ref) => {
    // If render prop is provided (RHF Controller pattern), render children into a field
    // container and let the inner form element consume `field` from the render args.
    if (render) {
      if (control) {
        return (
          <Controller
            control={control as Control<any>}
            name={String(name ?? "") as any}
            render={({ field }) => (
              <div ref={ref} className={cn("space-y-2", className)} {...props}>
                {render({ field: field as unknown as Record<string, unknown> })}
              </div>
            )}
          />
        );
      }
      // `field` has to exist as an object at runtime for the spread to work; provide a
      // minimal placeholder shaped like a Controller field when it has not been wired yet.
      const field: Record<string, unknown> = {
        value: undefined,
        onChange: undefined,
        onBlur: undefined,
        ref: undefined,
        name: String(name ?? ""),
      };
      return (
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          {...props}
        >
          {render({ field })}
        </div>
      );
    }
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    );
  }
);
FormField.displayName = "FormField";

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const { formItemId } = useFormField(
      // We grab the name from a parent FormField context
      "" // placeholder; actual name is derived from context
    );

    return (
      <div
        ref={ref}
        id={formItemId}
        className={cn(
          "grid gap-1.5",
          // Only apply the col-span when not a child
          false && "col-span-1",
          className
        )}
        {...props}
      />
    );
  }
);
FormItem.displayName = "FormItem";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * If true, the label will be required (adds a visual indicator).
   */
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, ...props }, ref) => {
    const { formItemId } = useFormField("");

    return (
      <Label
        ref={ref}
        htmlFor={formItemId}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      >
        {props.children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
    );
  }
);
FormLabel.displayName = "FormLabel";

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {/* Description slot */}
        {props.children}
      </div>
    );
  }
);
FormControl.displayName = "FormControl";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * If true, force the error message to show, even if the field has no error.
   */
  forceShow?: boolean;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, forceShow = false, ...props }, ref) => {
    const { formMessageId, error } = useFormField("");

    const body = error ? String(error) : props.children;

    if (!body || (typeof body === "string" && body.trim() === "")) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn(
          "text-sm text-red-600 dark:text-red-400",
          className
        )}
        {...props}
      >
        {body}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage };

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
FormDescription.displayName = "FormDescription";

export { FormDescription };
