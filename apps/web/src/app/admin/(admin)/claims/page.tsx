import { ClaimsQueueList } from "@/components/admin/ClaimsQueueList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claims queue",
  description: "Review and process pending claims.",
  };

export default async function ClaimsQueuePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">請求キュー</h1>
        <p className="mt-1 text-muted-600">処理待ちの請求を確認・対応します。</p>
      </div>

      <ClaimsQueueList claims={[]} />
    </div>
  );
}
