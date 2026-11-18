"use client";

import { useTranslations } from "next-intl";
import { enqueueToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler } from "react-hook-form";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(1, "required").max(80),
  email: z.string().email("invalidEmail"),
  subject: z.string().min(1, "required").max(120),
  message: z.string().min(10, "tooShort").max(2000),
  phone: z.string().min(6, "invalidPhone").max(30).optional().or(z.literal("")),
  policyNumber: z.string().min(1, "requiredIfProvided").max(40).optional().or(z.literal("")),
  claimNumber: z.string().min(1, "requiredIfProvided").max(40).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "required" }) }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
}export function ContactForm({ onSuccess }: ContactFormProps) {
  const t = useTranslations("contact");
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, setError, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
      policyNumber: "",
      claimNumber: "",
      consent: true,
    },
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await api.post("/contact", data);
      enqueueToast({ title: t("sentTitle"), description: t("sentDescription"), variant: "default" });
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      enqueueToast({ title: t("errorTitle"), description: err?.messageEn ?? t("errorDescription"), variant: "destructive" });
      setError("root", { type: "manual", message: t("errorDescription") });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset({
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
      policyNumber: "",
      claimNumber: "",
      consent: true,
    });
  };

  return (
    <Card className="border-navy-200 bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{t("form.title")}</CardTitle>
        <CardDescription className="max-w-xl">
          {t("form.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.namePlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                       
                       
                        placeholder={t("form.emailPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.subject")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                     
                     
                      placeholder={t("form.subjectPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.message")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                     
                     
                      placeholder={t("form.messagePlaceholder")}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.policyNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                       
                       
                        placeholder={t("form.policyNumberPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="claimNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.claimNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                     
                     
                      placeholder={t("form.claimNumberPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-navy-200 bg-navy-50 p-3">
                  <FormControl>
                    <Checkbox
                      id="consent"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-relaxed text-sm text-navy-700">
                    <FormLabel htmlFor="consent" className="font-medium cursor-pointer">
                      {t("form.consent")}
                    </FormLabel>
                    <FormDescription className="mt-1">
                      {t("form.consentDescription")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormDescription>
              {t("form.privacyNote")}
            </FormDescription>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.assign(`mailto:support@sample-insurance.jp?subject=${encodeURIComponent(t("form.subjectPlaceholder"))}`)}
              >
                {t("form.emailInstead")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
