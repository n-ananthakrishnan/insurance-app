import { notFound } from "next/navigation";
import { PolicyDetail } from "@/components/customer/PolicyDetail";
import { Metadata } from "next";
import { api } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return {
    title: "Policy details",
    description: "View policy details.",
  };
}

export default async function PolicyDetailPage({ params }: Props) {
  const { id } = await params;
  let policy;
  try {
    policy = await api.get<{
      id: string;
      policyNumber: string;
      status: string;
      startDate: string;
      endDate: string | null;
      monthlyPremiumYen: number | null;
      totalPremiumYen: number | null;
      paymentCycle: string;
      category: { id: string; nameJa: string; nameEn: string };
      product: { id: string; nameJa: string; nameEn: string };
      coverages: Array<{
        id: string;
        coverage: { id: string; nameJa: string; nameEn: string; maxAmountYen: number } | null;
        termYears: number;
        amount: number;
      }>;
      createdAt: string;
      updatedAt: string;
    }>(`/policies/${id}`);
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } }).response?.status === 404) {
      notFound();
    }
    throw err;
  }

  return <PolicyDetail policy={policy} />;
}
