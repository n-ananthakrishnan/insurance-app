import { CustomerList } from "@/components/admin/CustomerList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
  description: "Manage customer accounts.",
  };

export default async function CustomersPage() {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">顧客一覧</h1>
          <p className="mt-1 text-muted-600">顧客アカウントを管理します。</p>
        </div>
      </div>

      <CustomerList customers={[]} />
    </div>
  );
}
