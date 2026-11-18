import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin settings",
  description: "Manage admin settings.",
  };

export default async function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">管理設定</h1>
        <p className="mt-1 text-muted-600">管理画面の設定を管理します。</p>
      </div>

      <AdminSettingsForm />
    </div>
  );
}
