import { getTranslations } from "@/i18n/request";
import { ClaimList } from "@/components/customer/ClaimList";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "My claims",
  description: "View your claims and their current status.",
  };

export default async function ClaimsPage() {
  const t = await getTranslations("claims");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{t("title")}</h1>
          <p className="mt-1 text-muted-600">{t("subtitle")}</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/claims/new">
            <Plus className="w-4 h-4 mr-2" />
            {t("newClaim")}
          </Link>
        </Button>
      </div>

      <ClaimList claims={[]} />
    </div>
  );
}
