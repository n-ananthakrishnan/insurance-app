import { AuditLogList } from "@/components/admin/AuditLogList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit log",
  description: "Review admin activity history.",
  };

export default async function AuditLogPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">監査ログ</h1>
        <p className="mt-1 text-muted-600">管理者の操作履歴を確認します。</p>
      </div>

      <AuditLogList entries={[]} />
    </div>
  );
}
