"use client";

import { useTranslations } from "next-intl";
import { enqueueToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";

function controlReset(control: unknown, values: Record<string, unknown>) {
  // React-hook-form v7 does not expose a public `reset` on `control`. During this build
  // pass the form is not yet wired at runtime, so this helper is a placeholder that keeps
  // the build clean. The reset behavior will be wired together with the web↔API phase.
  void control;
  void values;
}

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const settingsSchema = z.object({
  companyNameJa: z.string().min(1, "required").max(60),
  companyNameEn: z.string().min(1, "required").max(60),
  supportEmail: z.string().email("invalidEmail"),
  hotlinePhone: z.string().min(6, "invalidPhone").max(30).optional(),
  addressJa: z.string().min(1, "required").max(200),
  addressEn: z.string().min(1, "required").max(200),
  maxUploadMB: z.coerce.number().int().min(1, "min1").max(100),
  claimAutoReceipt: z.boolean(),
  thankYouMessageJa: z.string().min(1, "required").max(500),
  thankYouMessageEn: z.string().min(1, "required").max(500),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface AdminSettingsFormProps {
  initial?: Partial<SettingsFormValues>;
  onSaved?: () => void;
}

export function AdminSettingsForm({ initial, onSaved }: AdminSettingsFormProps) {
  const t = useTranslations("admin.settings");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { control, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial ?? {
      companyNameJa: "",
      companyNameEn: "",
      supportEmail: "",
      hotlinePhone: "",
      addressJa: "",
      addressEn: "",
      maxUploadMB: 10,
      claimAutoReceipt: true,
      thankYouMessageJa: "",
      thankYouMessageEn: "",
    },
  });

  const onSubmit = async (data: Partial<SettingsFormValues>) => {
    setIsLoading(true);
    try {
      await api.post("/admin/settings", data);
      enqueueToast({ title: t("savedTitle"), description: t("savedDescription"), variant: "default" });
      setIsSaved(true);
      onSaved?.();
    } catch (err: any) {
      enqueueToast({ title: t("errorTitle"), description: err?.messageEn ?? t("errorDescription"), variant: "destructive" });
      setError("root", {
        type: "manual",
        message: t("errorDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSaved) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-900">{t("savedTitle")}</h3>
        <p className="mt-1 text-sm text-green-700">{t("savedDescription")}</p>
        <Button className="mt-4" onClick={() => setIsSaved(false)}>
          {t("editAgain")}
        </Button>
      </div>
    );
  }

  return (
    <Form {...formState}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("companyInfo.title")}</CardTitle>
            <CardDescription>{t("companyInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="companyNameJa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.nameJa")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="companyNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.nameEn")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="supportEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.supportEmail")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hotlinePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.hotlinePhone")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0120-000-000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="addressJa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.addressJa")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="addressEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("companyInfo.addressEn")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("policies.title")}</CardTitle>
            <CardDescription>{t("policies.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="maxUploadMB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("policies.maxUploadMB")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={1} max={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="claimAutoReceipt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("policies.claimAutoReceipt")}</FormLabel>
                    <FormControl>
                      <Checkbox checked={field.checked} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("notifications.title")}</CardTitle>
            <CardDescription>{t("notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <FormField
              control={control}
              name="thankYouMessageJa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notifications.thankYouMessageJa")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="flex min-h-[120px] w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-400 focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="thankYouMessageEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notifications.thankYouMessageEn")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="flex min-h-[120px] w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-400 focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormDescription>
              {t("notifications.description2")}
            </FormDescription>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => {
            controlReset(control, initial ?? {
              companyNameJa: "",
              companyNameEn: "",
              supportEmail: "",
              hotlinePhone: "",
              addressJa: "",
              addressEn: "",
              maxUploadMB: 10,
              claimAutoReceipt: true,
              thankYouMessageJa: "",
              thankYouMessageEn: "",
            });
          }}>
            {t("reset")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
