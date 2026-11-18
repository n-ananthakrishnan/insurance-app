import { NotificationList } from "@/components/customer/NotificationList";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your latest notifications.",
};

export default async function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">通知</h1>
          <p className="mt-1 text-muted-600">最新の通知を確認できます。</p>
        </div>
        <Button variant="ghost" size="sm">
          すべての通知を既読にする
        </Button>
      </div>

      <NotificationList notifications={[]} />
    </div>
  );
}
