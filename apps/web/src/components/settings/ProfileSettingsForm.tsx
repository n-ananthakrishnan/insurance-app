"use client";

import { useTranslations } from "next-intl";
import { enqueueToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/Form";
import { api } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const profileSchema = z.object({
  nameJa: z.string().min(1, "required").max(80),
  nameEn: z.string().min(1, "required").max(80),
  phone: z.string().min(6, "invalidPhone").max(30).optional().or(z.literal("")),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, "invalidPostalCode").optional().or(z.literal("")),
  addressJa: z.string().min(1, "required").max(200).optional().or(z.literal("")),
  addressEn: z.string().min(1, "required").max(200).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsFormProps {
  initial?: Partial<ProfileFormValues>;
  onSuccess?: () => void;
}

export function ProfileSettingsForm({ initial, onSuccess }: ProfileSettingsFormProps) {
  const t = useTranslations("settings.profile");
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState, setError } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial ?? {
      nameJa: "",
      nameEn: "",
      phone: "",
      postalCode: "",
      addressJa: "",
      addressEn: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await api.patch("/customers/me", data);
      enqueueToast({ title: t("savedTitle"), description: t("savedDescription"), variant: "default" });
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="nameJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.nameJa")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.nameJaPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.nameEn")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.nameEnPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.phone")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.phonePlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.postalCode")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.postalCodePlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="addressJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.addressJa")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.addressJaPlaceholder")}
                      />
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
                    <FormLabel>{t("form.addressEn")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.addressEnPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
