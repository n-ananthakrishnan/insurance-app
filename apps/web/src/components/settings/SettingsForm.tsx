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

const profileSchema = z.object({
  nameJa: z.string().min(1, "required").max(80),
  nameEn: z.string().min(1, "required").max(80),
  phone: z.string().min(6, "invalidPhone").max(30).optional().or(z.literal("")),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, "invalidPostalCode").optional().or(z.literal("")),
  addressJa: z.string().min(1, "required").max(200).optional().or(z.literal("")),
  addressEn: z.string().min(1, "required").max(200).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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

interface SettingsFormProps {
  mode?: "profile" | "password";
  user?: {
    nameJa?: string | null;
    nameEn?: string | null;
    phone?: string | null;
    postalCode?: string | null;
    addressJa?: string | null;
    addressEn?: string | null;
  };
  onSuccess?: () => void;
}

export function SettingsForm({ mode = "profile", user, onSuccess }: SettingsFormProps) {
  const t = useTranslations("settings");
  const profileT = useTranslations("settings.profile");
  const passwordT = useTranslations("settings.password");
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nameJa: user?.nameJa ?? "",
      nameEn: user?.nameEn ?? "",
      phone: user?.phone ?? "",
      postalCode: user?.postalCode ?? "",
      addressJa: user?.addressJa ?? "",
      addressEn: user?.addressEn ?? "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await api.patch("/customers/me", {
        nameJa: data.nameJa,
        nameEn: data.nameEn,
        phone: data.phone || null,
        postalCode: data.postalCode || null,
        addressJa: data.addressJa || null,
        addressEn: data.addressEn || null,
      });
      enqueueToast({ title: profileT("savedTitle"), description: profileT("savedDescription"), variant: "default" });
      onSuccess?.();
    } catch (err: any) {
      enqueueToast({ title: profileT("errorTitle"), description: err?.messageEn ?? profileT("errorDescription"), variant: "destructive" });
      profileForm.setError("root", { type: "manual", message: profileT("errorDescription") });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.patch("/customers/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      enqueueToast({ title: passwordT("changedTitle"), description: passwordT("changedDescription"), variant: "default" });
      onSuccess?.();
    } catch (err: any) {
      enqueueToast({ title: passwordT("errorTitle"), description: err?.messageEn ?? passwordT("errorDescription"), variant: "destructive" });
      passwordForm.setError("root", { type: "manual", message: passwordT("errorDescription") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1>
        {mode === "profile" && (
          <span className="text-sm text-muted-500">{t("lastSaved")}: </span>
        )}
      </div>

      {mode === "profile" ? (
        <Card className="border-navy-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">{profileT("form.title")}</CardTitle>
            <CardDescription>{profileT("form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm.formState}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="nameJa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.nameJa")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.nameJaPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.nameEn")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.nameEnPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.phone")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.phonePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.postalCode")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.postalCodePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="addressJa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.addressJa")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.addressJaPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="addressEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{profileT("form.addressEn")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                           
                           
                            placeholder={profileT("form.addressEnPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormDescription>{profileT("form.hint")}</FormDescription>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? profileT("saving") : profileT("save")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-navy-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">{passwordT("form.title")}</CardTitle>
            <CardDescription>{passwordT("form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm.formState}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{passwordT("form.currentPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                         
                         
                          placeholder={passwordT("form.currentPasswordPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{passwordT("form.newPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                         
                         
                          placeholder={passwordT("form.newPasswordPlaceholder")}
                        />
                      </FormControl>
                      <FormDescription>{passwordT("form.newPasswordDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{passwordT("form.confirmNewPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                         
                         
                          placeholder={passwordT("form.confirmNewPasswordPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? passwordT("changing") : passwordT("change")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
