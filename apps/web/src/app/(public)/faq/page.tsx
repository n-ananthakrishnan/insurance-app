import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Find answers to common questions.",
};

export default async function FaqPage() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy-900">よくある質問</h1>
          <p className="mt-2 text-muted-600">よくある質問への回答をご確認ください。</p>
        </div>

        <FaqAccordion />
      </div>
    </div>
  );
}
