import { ContactForm } from "@/components/contact/ContactForm";
import { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Have questions about products or claims? Contact us.",
};

export default async function ContactPage() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-navy-900">お問い合わせ</h1>
          <p className="mt-2 text-muted-600">
            商品・契約・請求など、どんなご質問でもお気軽にお寄せください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Office info */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-navy-200 bg-navy-50 p-6 h-full">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">事務所情報</h2>
              <div className="space-y-4 text-sm text-muted-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-navy-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy-800">住所</p>
                    <p>〒100-0001</p>
                    <p>東京都千代田区千代田1-1-1</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-navy-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy-800">電話</p>
                    <p>0120-000-000</p>
                    <p className="text-xs text-muted-500">フリーダイヤル</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 text-navy-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy-800">メール</p>
                    <p>support@samplese.japan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0 text-navy-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy-800">受付時間</p>
                    <p>平日 9:00–17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
