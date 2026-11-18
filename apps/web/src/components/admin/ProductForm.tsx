"use client";

import { useTranslations } from "next-intl";
import type { Category } from "@sample-insurance/shared";
import { enqueueToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import { api } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const productSchema = z.object({
  categoryId: z.string().min(1, "required"),
  nameJa: z.string().min(1, "required").max(80),
  nameEn: z.string().min(1, "required").max(80),
  taglineJa: z.string().max(200).optional(),
  taglineEn: z.string().max(200).optional(),
  contentJa: z.string().max(5000).optional(),
  contentEn: z.string().max(5000).optional(),
  basePremiumYen: z.coerce.number().int().min(0, "min0"),
  paymentCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED"]),
  enabledForCustomers: z.boolean(),
  coverages: z
    .array(
      z.object({
        coverageId: z.string(),
        termYears: z.coerce.number().int().min(1, "min1"),
        amount: z.coerce.number().int().min(0, "min0"),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: Category[];
  initial?: Partial<ProductFormValues>;
  onSaved?: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}

export function ProductForm({
  categories,
  initial,
  onSaved,
  submitLabel = "保存",
  isEdit = false,
}: ProductFormProps) {
  const t = useTranslations("admin.products");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { control, handleSubmit, formState, setError, resetField } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? {
      categoryId: "",
      nameJa: "",
      nameEn: "",
      taglineJa: "",
      taglineEn: "",
      contentJa: "",
      contentEn: "",
      basePremiumYen: 0,
      paymentCycle: "ANNUAL",
      status: "DRAFT",
      enabledForCustomers: true,
      coverages: [],
    },
  });

  const onSubmit = async (data: Partial<ProductFormValues>) => {
    setIsLoading(true);
    try {
      await api.post("/admin/products", data);
      enqueueToast({ title: t("savedTitle"), description: t("savedDescription"), variant: "default" });
      setIsSaved(true);
      onSaved?.();
    } catch (err: any) {
      enqueueToast({ title: t("errorTitle"), description: err?.messageEn ?? t("errorDescription"), variant: "destructive" });
      setError("root", { type: "manual", message: t("errorDescription") });
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
          {t("addAnother")}
        </Button>
      </div>
    );
  }

  return (
    <Form {...formState}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("basics.title")}</CardTitle>
            <CardDescription>{t("basics.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="nameJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.nameJa")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("basics.nameJaPlaceholder")} />
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
                    <FormLabel>{t("basics.nameEn")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("basics.nameEnPlaceholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.category")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("basics.categoryPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nameJa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="basePremiumYen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.basePremiumYen")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={0} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="taglineJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.taglineJa")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="任意" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="taglineEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.taglineEn")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="contentJa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.contentJa")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="任意" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="contentEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basics.contentEn")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Optional" rows={4} />
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
            <CardTitle className="text-base">{t("terms.title")}</CardTitle>
            <CardDescription>{t("terms.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="paymentCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("terms.paymentCycle")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">{t("terms.cycle.monthly")}</SelectItem>
                        <SelectItem value="QUARTERLY">{t("terms.cycle.quarterly")}</SelectItem>
                        <SelectItem value="ANNUAL">{t("terms.cycle.annual")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("terms.status")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">{t("terms.status.draft")}</SelectItem>
                        <SelectItem value="ACTIVE">{t("terms.status.active")}</SelectItem>
                        <SelectItem value="EXPIRED">{t("terms.status.expired")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name="enabledForCustomers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-navy-200 bg-navy-50 p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="enabled-for-customers"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="enabled-for-customers" className="text-sm font-medium">
                      {t("terms.enabledForCustomers")}
                    </FormLabel>
                    <FormDescription className="text-xs">
                      {t("terms.enabledForCustomersDescription")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {isEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("coverages.title")}</CardTitle>
              <CardDescription>{t("coverages.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="coverages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("coverages.label")}</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {(Array.isArray(field.value) && field.value.length === 0) ? (
                          <p className="text-sm text-muted-500">{t("coverages.empty")}</p>
                        ) : (
                          (Array.isArray(field.value) ? field.value : []).map((coverage: NonNullable<ProductFormValues["coverages"]>[number], index: number) => {
                            const cov = coverage as NonNullable<ProductFormValues["coverages"]>[number];
                            const next: ProductFormValues["coverages"] = (Array.isArray(field.value) ? field.value : []).filter((_: unknown, i: number) => i !== index) as ProductFormValues["coverages"];
                            return (
                              <div
                                key={cov.coverageId}
                                className="flex flex-col gap-2 rounded-lg border border-navy-200 bg-white p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-navy-900">
                                    {t("coverages.coverage", { index: index + 1 })}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="-mr-2"
                                    onClick={() => {
                                      const updated: ProductFormValues["coverages"] = next;
                                      (field.onChange as (value: ProductFormValues["coverages"]) => void)(updated);
                                      resetField("coverages", { defaultValue: updated });
                                    }}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <FormField
                                    control={control}
                                    name={`coverages.${index}.termYears` as "coverages.0.termYears"}
                                    render={({ field: innerField }) => {
                                      const innerValue = innerField.value as number | undefined;
                                      const innerOnChange = innerField.onChange as (value: number | string) => void;
                                      return (
                                        <FormItem>
                                          <FormLabel>{t("coverages.termYears")}</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              value={innerValue ?? ""}
                                              onChange={(e) => innerOnChange(e.target.value)}
                                              min={1}
                                              className="w-full"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      );
                                    }}
                                  />
                                  <FormField
                                    control={control}
                                    name={`coverages.${index}.amount` as "coverages.0.amount"}
                                    render={({ field: innerField }) => {
                                      const innerValue = innerField.value as number | undefined;
                                      const innerOnChange = innerField.onChange as (value: number | string) => void;
                                      return (
                                        <FormItem>
                                          <FormLabel>{t("coverages.amount")}</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              value={innerValue ?? ""}
                                              onChange={(e) => innerOnChange(e.target.value)}
                                              min={0}
                                              className="w-full"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </FormControl>
                    {/* カバレッジの追加/編集専用の FormMessage が表示されるため、ここでは FormMessage を表示しない */}
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const current = control._formValues?.coverages as ProductFormValues["coverages"] | undefined;
                  const next: ProductFormValues["coverages"] = (current ?? []).concat({
                    coverageId: crypto.randomUUID(),
                    termYears: 1,
                    amount: 0,
                  });
                  resetField("coverages", { defaultValue: next as ProductFormValues["coverages"] });
                }}
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t("coverages.add")}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">                <Button type="button" variant="ghost" onClick={() => { const _v = "" as ProductFormValues["categoryId"]; resetField("categoryId" as keyof ProductFormValues, { defaultValue: _v }); }}>
            {t("reset")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("saving") : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
