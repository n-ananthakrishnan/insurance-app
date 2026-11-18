import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const [customerHash, adminHash] = await Promise.all([
    bcrypt.hash("Password1", 10),
    bcrypt.hash("AdminPass1", 10),
  ]);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash: customerHash, role: "CUSTOMER", emailVerified: true },
    create: { email: "customer@example.com", passwordHash: customerHash, role: "CUSTOMER", emailVerified: true, emailVerifiedAt: new Date() },
  });
  await prisma.customerProfile.upsert({
    where: { userId: customer.id },
    update: { nameJa: "佐藤 花子", nameEn: "Hanako Sato", phone: "+81-90-1234-5678" },
    create: { userId: customer.id, nameJa: "佐藤 花子", nameEn: "Hanako Sato", phone: "+81-90-1234-5678" },
  });
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash, role: "ADMIN", emailVerified: true },
    create: { email: "admin@example.com", passwordHash: adminHash, role: "ADMIN", emailVerified: true, emailVerifiedAt: new Date(), profile: { create: { nameJa: "管理者", nameEn: "Demo Administrator" } } },
  });

  const definitions = [
    { slug: "auto", nameJa: "自動車保険", nameEn: "Auto insurance", descriptionJa: "車とドライバーを守る保険です。", descriptionEn: "Protection for your car and the people in it.", icon: "car" },
    { slug: "home", nameJa: "火災・住まいの保険", nameEn: "Home insurance", descriptionJa: "住まいと大切な家財を守ります。", descriptionEn: "Cover for your home and belongings.", icon: "home" },
    { slug: "medical", nameJa: "医療保険", nameEn: "Medical insurance", descriptionJa: "入院や治療の費用に備えます。", descriptionEn: "Help with the cost of treatment and hospital stays.", icon: "heart" },
    { slug: "travel", nameJa: "旅行保険", nameEn: "Travel insurance", descriptionJa: "旅行中の思いがけないトラブルに備えます。", descriptionEn: "Support when unexpected problems happen on a trip.", icon: "plane" },
  ];
  const categories = new Map<string, string>();
  for (const category of definitions) {
    const saved = await prisma.productCategory.upsert({ where: { slug: category.slug }, update: category, create: category });
    categories.set(category.slug, saved.id);
  }

  const products = [
    { slug: "everyday-auto", category: "auto", nameJa: "毎日の自動車保険", nameEn: "Everyday Auto Cover", taglineJa: "事故や故障のときも安心を。", taglineEn: "Reliable support for everyday driving.", descriptionJa: "対人・対物補償と事故時のサポートを備えた自動車保険です。", descriptionEn: "Auto cover with liability protection and accident support.", priceHintJa: "月額 2,400円から", priceHintEn: "From ¥2,400 per month", examplePremiumJa: "月額 2,400円", examplePremiumEn: "¥2,400 per month" },
    { slug: "home-and-belongings", category: "home", nameJa: "住まいと家財の保険", nameEn: "Home & Belongings Cover", taglineJa: "住まいと大切な家財を守ります。", taglineEn: "Protection for your home and belongings.", descriptionJa: "火災や自然災害に備える住まいの保険です。", descriptionEn: "Flexible cover for your home, belongings, fire, and natural disasters.", priceHintJa: "月額 1,800円から", priceHintEn: "From ¥1,800 per month", examplePremiumJa: "月額 1,800円", examplePremiumEn: "¥1,800 per month" },
    { slug: "medical-support", category: "medical", nameJa: "医療サポート保険", nameEn: "Medical Support Cover", taglineJa: "入院や手術に備える安心を。", taglineEn: "Peace of mind for hospital stays and surgery.", descriptionJa: "入院や手術にかかる費用に備える医療保険です。", descriptionEn: "Straightforward cover for hospital stays and surgery.", priceHintJa: "月額 1,300円から", priceHintEn: "From ¥1,300 per month", examplePremiumJa: "月額 1,300円", examplePremiumEn: "¥1,300 per month" },
    { slug: "travel-peace-of-mind", category: "travel", nameJa: "旅行あんしん保険", nameEn: "Travel Peace of Mind", taglineJa: "旅先でのもしもに備えます。", taglineEn: "Support for the unexpected while you travel.", descriptionJa: "旅行中のけがや病気、手荷物のトラブルに備えます。", descriptionEn: "Cover for illness, injury, and baggage problems while traveling.", priceHintJa: "旅行日数に応じた料金", priceHintEn: "Flexible pricing by trip length", examplePremiumJa: "旅行内容により異なります", examplePremiumEn: "Varies by trip" },
  ];
  const productIds = new Map<string, string>();
  for (const { category, ...data } of products) {
    const saved = await prisma.product.upsert({ where: { slug: data.slug }, update: { ...data, categoryId: categories.get(category)!, isActive: true }, create: { ...data, categoryId: categories.get(category)!, isActive: true, coverageListJa: "基本補償、事故対応サポート", coverageListEn: "Core protection and claims support" } });
    productIds.set(data.slug, saved.id);
  }

  const policy = await prisma.policy.upsert({
    where: { policyNumber: "SIJ-DEMO-0001" },
    update: { customerId: customer.id, productId: productIds.get("everyday-auto")!, status: "ACTIVE" },
    create: { customerId: customer.id, productId: productIds.get("everyday-auto")!, policyNumber: "SIJ-DEMO-0001", status: "ACTIVE", premium: 2400, planNameJa: "スタンダードプラン", planNameEn: "Standard plan", effectiveDate: new Date("2026-01-01"), expiryDate: new Date("2027-01-01") },
  });

  const newsCategory = await prisma.newsCategory.upsert({ where: { slug: "announcements" }, update: {}, create: { slug: "announcements", nameJa: "お知らせ", nameEn: "Announcements" } });
  const newsItems = [
    { slug: "roadside-support-update", titleJa: "ロードサービス窓口のご案内", titleEn: "Roadside assistance is here for you", summaryJa: "事故や故障の際のサポート窓口をご案内します。", summaryEn: "How to reach our support team after an accident or breakdown.", bodyJa: "緊急の場合は警察・救急へご連絡のうえ、保険会社の事故受付窓口へお電話ください。", bodyEn: "In an emergency, contact local emergency services first, then call our claims support line." },
    { slug: "online-account-guide", titleJa: "マイページの使い方", titleEn: "Getting started with your online account", summaryJa: "ご契約内容や事故報告をオンラインで確認できます。", summaryEn: "Review your policy details and report an incident online.", bodyJa: "マイページでは契約内容の確認や事故報告ができます。", bodyEn: "Your account lets you review policy information and submit an accident report." },
    { slug: "service-hours", titleJa: "お問い合わせ窓口について", titleEn: "Contacting our support team", summaryJa: "お問い合わせ方法をご確認ください。", summaryEn: "Find the right way to get in touch with our team.", bodyJa: "お問い合わせフォームをご利用ください。", bodyEn: "Use our contact form and our team will follow up." },
  ];
  for (const item of newsItems) await prisma.newsArticle.upsert({ where: { slug: item.slug }, update: { ...item, categoryId: newsCategory.id }, create: { ...item, categoryId: newsCategory.id, categoryTag: "Announcements", isPinned: item.slug === "roadside-support-update" } });

  const faqCategory = await prisma.faqCategory.upsert({ where: { slug: "claims" }, update: {}, create: { slug: "claims", nameJa: "事故・保険金請求", nameEn: "Claims and accidents", displayOrder: 1 } });
  const faqItems = [
    ["事故にあった場合、まず何をすればよいですか？", "What should I do first after an accident?", "けが人がいる場合は救急車を呼び、交通事故の場合は警察へ連絡してください。その後、事故受付窓口へご連絡ください。", "Call emergency services if anyone is injured. For a traffic accident, contact the police, then notify our claims team."],
    ["事故の報告に必要な情報は何ですか？", "What information do I need to report an accident?", "契約番号、事故の日時と場所、事故の状況をご用意ください。", "Have your policy number, the time and place of the incident, and a description ready."],
    ["マイページから事故を報告できますか？", "Can I report an accident online?", "はい。ログイン後、事故報告ページからご契約を選択して報告できます。", "Yes. Sign in and use the accident report page to select your policy and submit the details."],
    ["契約内容はどこで確認できますか？", "Where can I check my policy details?", "ログイン後、マイページの契約一覧からご確認いただけます。", "Sign in and open the Policies section in your account."],
    ["問い合わせの返事はいつ届きますか？", "When will I hear back about my inquiry?", "通常、営業日中に担当者よりご連絡いたします。", "Our team usually responds during business hours."],
  ];
  for (let i = 0; i < faqItems.length; i++) {
    const [questionJa, questionEn, answerJa, answerEn] = faqItems[i];
    const questionEnKey = questionEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const questionSlug = `claims-${i + 1}-${questionEnKey}`;
    const id = `demo-faq-${i + 1}`;
    await prisma.faqItem.upsert({ where: { id }, update: { questionJa, questionEn, answerJa, answerEn, categoryId: faqCategory.id, status: "PUBLISHED", sortOrder: i + 1 }, create: { id, questionJa, questionEn, answerJa, answerEn, categoryId: faqCategory.id, status: "PUBLISHED", sortOrder: i + 1 } });
    void questionSlug;
  }

  console.log("Seed complete.");
  console.log("Customer login: customer@example.com / Password1");
  console.log("Admin login: admin@example.com / AdminPass1");
  console.log(`Demo policy ID: ${policy.id} (number ${policy.policyNumber})`);
}

main().catch((error) => { console.error("Seed failed:", error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
