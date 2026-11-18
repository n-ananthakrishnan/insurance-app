"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormContext, useFormField } from "./use-form";
import { Label } from "./Label";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The name of the field. Used to register with the parent form.
   */
  name: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, name, children, ...props }, ref) => {
    const { control } = useFormContext();
    const field = useFormField(name);

    const { onFocus, ...restProps } = props;

    React.useEffect(() => {
      if (name && control) {
        // Register the field with the form context.
        control.register(name, {
          required: field.required,
          minLength: field.minLength,
          maxLength: field.maxLength,
          pattern: field.pattern,
          validate: field.validate,
        });
      }
    }, [name, control, field.required, field.minLength, field.maxLength, field.pattern, field.validate]);

    const showError = !!field.error;

    return (
      <div
        ref={ref}
        className={cn("space-y-1", className)}
        {...restProps}
      >
        {/* Label */}
        {field.label !== undefined && (
          <Label
            htmlFor={field.id}
            className={cn("text-sm font-medium", showError && "text-red-600")}
          >
            {field.label}
          </Label>
        )}

        {/* Field content (Input, Select, etc.) */}
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              error: showError ? field.error : undefined,
              field: {
                value: field.value,
                onChange: field.onChange,
                onBlur: field.onBlur,
                name,
                ref: children.props.ref,
              },
              ...children.props,
            })
          : children}
      </div>
    );
  }
);
FormField.displayName = "FormField";

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, children, ...props }, ref) => {
    const { control, formId } = useFormContext();
    const fieldName = React.useId();

    React.useEffect(() => {
      if (control) {
        // Create a data attribute to link the item to the form control.
        // This is a minimal approach; a full implementation would use Context.
      }
    }, [control]);

    return (
      <div
        ref={ref}
        id={`${formId}-${fieldName}`}
        className={cn("grid gap-1.5", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ id?: string }>, {
              id: `${formId}-${fieldName}`,
            } as React.HTMLAttributes<HTMLElement>);
          }
          return child;
        })}
      </div>
    );
  }
);
FormItem.displayName = "FormItem";

// Re-export individual pieces for composition.
export { FormField, FormItem };
