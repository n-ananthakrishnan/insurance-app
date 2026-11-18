import { Metadata } from "next";
import { Dashboard } from "@/components/admin/Dashboard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Manage claims, customers, products, news and FAQ.",
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">管理画面</h1>
        <p className="mt-1 text-muted-600">請求、顧客、商品、ニュース、FAQを管理します。</p>
      </div>
      <Dashboard />
    </div>
  );
}
