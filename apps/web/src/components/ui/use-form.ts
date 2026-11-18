"use client";

import * as React from "react";

interface UseFormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  control: ReturnType<typeof useControlledForm> | null;
  formId: string;
  register: (name: string, opts?: Record<string, unknown>) => void;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string) => void;
  clearErrors: (name?: string) => void;
  reset: () => void;
}

const FormContext = React.createContext<UseFormContextValue | null>(null);

const fallbackFormContext: UseFormContextValue = {
  values: {},
  errors: {},
  control: null,
  formId: "",
  register: () => {},
  setValue: () => {},
  setError: () => {},
  clearErrors: () => {},
  reset: () => {},
};

export function useFormContext() {
  return React.useContext(FormContext) ?? fallbackFormContext;
}

function useControlledForm(initialValues: Record<string, unknown> = {}) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const register = React.useCallback((name: string, _opts?: Record<string, unknown>) => {
    // no-op: actual registration handled by FormField
  }, []);

  const setValue = React.useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const setError = React.useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = React.useCallback((name?: string) => {
    setErrors((prev) => {
      if (name) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return {};
    });
  }, []);

  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, errors, register, setValue, setError, clearErrors, reset };
}

export function useFormField(name: string) {
  const { values, errors, setValue, setError } = useFormContext();
  const id = React.useId();

  const value = values[name] as string | undefined;
  const error = errors[name];

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(name, e.target.value);
    },
    [name, setValue]
  );

  const onBlur = React.useCallback(() => {
    // no-op placeholder
  }, []);

  return {
    id,
    formItemId: id,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    name,
    label: undefined as React.ReactNode,
    value,
    error,
    onChange,
    onBlur,
    required: false,
    minLength: undefined,
    maxLength: undefined,
    pattern: undefined,
    validate: undefined,
  };
}
