"use client";

import { useTranslations } from "next-intl";
import { enqueueToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/Form";
import { api } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "required"),
    newPassword: z
      .string()
      .min(8, "tooShort")
      .max(128, "tooLong")
      .regex(/[A-Z]/, "needsUppercase")
      .regex(/[a-z]/, "needsLowercase")
      .regex(/[0-9]/, "needsNumber")
      .regex(/[^A-Za-z0-9]/, "needsSymbol"),
    confirmNewPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "mismatch",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordSettingsFormProps {
  onSuccess?: () => void;
}

export function PasswordSettingsForm({ onSuccess }: PasswordSettingsFormProps) {
  const t = useTranslations("settings.password");
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState, setError } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.patch("/customers/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      enqueueToast({ title: t("changedTitle"), description: t("changedDescription"), variant: "default" });
      onSuccess?.();
    } catch (err: any) {
      enqueueToast({ title: t("errorTitle"), description: err?.messageEn ?? t("errorDescription"), variant: "destructive" });
      setError("root", { type: "manual", message: t("errorDescription") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-navy-200 bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...formState}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.currentPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                     
                     
                      placeholder={t("form.currentPasswordPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                     
                     
                      placeholder={t("form.newPasswordPlaceholder")}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.newPasswordDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.confirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                     
                     
                      placeholder={t("form.confirmNewPasswordPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("changing") : t("change")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
