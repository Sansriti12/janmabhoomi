import { PrismaClient, PublicationType, PublicationStatus, ArticleStatus, BillingInterval } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== SAURASHTRA TRUST DATABASE SEEDING (SAMPLE / DEV DATA ONLY) ===");

  // 1. Seed All 8 Publications / Products
  console.log("\n[1/5] Seeding 8 Publications / Products...");
  const publications = [
    {
      id: "pub-janmabhoomi",
      code: "JB",
      slug: "janmabhoomi",
      publicationType: PublicationType.DAILY_NEWSPAPER,
      nameEn: "Janmabhoomi",
      nameGu: "જન્મભૂમિ",
      taglineEn: "News • Trust • Impartiality",
      taglineGu: "સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
      frequencyEn: "Daily Broadsheet (Evening)",
      frequencyGu: "દૈનિક સાંધ્ય સમાચારપત્ર",
      establishedYear: 1934,
      primaryCity: "Mumbai",
      websiteUrl: "/",
      epaperUrl: "/epaper",
      logoAssetPath: "/assets/logos/janmabhoomi-logo.svg",
      logoPlaceholderCode: "જન્મભૂમિ",
      epaperFreePreviewPages: 0, // Configurable preview limit
      status: PublicationStatus.ACTIVE,
    },
    {
      id: "pub-kutchmitra",
      code: "KM",
      slug: "kutchmitra",
      publicationType: PublicationType.DAILY_NEWSPAPER,
      nameEn: "Kutchmitra",
      nameGu: "કચ્છમિત્ર",
      taglineEn: "The Authentic Voice of Kutch",
      taglineGu: "કચ્છનું વિશ્વાસપાત્ર દૈનિક",
      frequencyEn: "Daily Morning",
      frequencyGu: "દૈનિક પ્રભાત",
      establishedYear: 1947,
      primaryCity: "Bhuj",
      websiteUrl: "/about#kutchmitra",
      epaperUrl: "/epaper?publication=kutchmitra",
      logoAssetPath: "/assets/logos/kutchmitra-logo.svg",
      logoPlaceholderCode: "કચ્છમિત્ર",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
    {
      id: "pub-phulchhab",
      code: "PC",
      slug: "phulchhab",
      publicationType: PublicationType.DAILY_NEWSPAPER,
      nameEn: "Phulchhab",
      nameGu: "ફૂલછાબ",
      taglineEn: "Saurashtra's Leading Daily Since 1921",
      taglineGu: "સૌરાષ્ટ્રનું અગ્રણી દૈનિક",
      frequencyEn: "Daily Morning",
      frequencyGu: "દૈનિક પ્રભાત",
      establishedYear: 1921,
      primaryCity: "Rajkot",
      websiteUrl: "/about#phulchhab",
      epaperUrl: "/epaper?publication=phulchhab",
      logoAssetPath: "/assets/logos/phulchhab-logo.svg",
      logoPlaceholderCode: "ફૂલછાબ",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
    {
      id: "pub-vyapar-gu",
      code: "VG",
      slug: "vyapar-gujarati",
      publicationType: PublicationType.BIWEEKLY_NEWSPAPER,
      nameEn: "Vyapar (Gujarati)",
      nameGu: "વ્યાપાર (ગુજરાતી)",
      taglineEn: "India's Premier Financial Bi-Weekly",
      taglineGu: "ભારતનું પ્રથમ આર્થિક દ્વિ-સાપ્તાહિક",
      frequencyEn: "Bi-Weekly (Wed & Sat)",
      frequencyGu: "દ્વિ-સાપ્તાહિક (બુધ અને શનિ)",
      establishedYear: 1949,
      primaryCity: "Mumbai",
      websiteUrl: "/about#vyapar",
      epaperUrl: "/epaper?publication=vyapar-gujarati",
      logoAssetPath: "/assets/logos/vyapar-logo.svg",
      logoPlaceholderCode: "વ્યાપાર",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
    {
      id: "pub-vyapar-hi",
      code: "VH",
      slug: "vyapar-hindi",
      publicationType: PublicationType.WEEKLY_NEWSPAPER,
      nameEn: "Vyapar (Hindi)",
      nameGu: "વ્યાપાર (હિન્દી)",
      taglineEn: "National Financial & Commodity Intelligence",
      taglineGu: "રાષ્ટ્રીય આર્થિક અને કોમોડિટી સમાચાર",
      frequencyEn: "Weekly Financial",
      frequencyGu: "સાપ્તાહિક આર્થિક",
      establishedYear: 1987,
      primaryCity: "Mumbai",
      websiteUrl: "/about#vyapar-hindi",
      epaperUrl: "/epaper?publication=vyapar-hindi",
      logoAssetPath: "/assets/logos/vyapar-hindi-logo.svg",
      logoPlaceholderCode: "व्यापार",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
    {
      id: "pub-pravasi",
      code: "JP",
      slug: "janmabhoomi-pravasi",
      publicationType: PublicationType.WEEKLY_NEWSPAPER,
      nameEn: "Janmabhoomi Pravasi",
      nameGu: "જન્મભૂમિ પ્રવાસી",
      taglineEn: "The Sunday Weekly Literary & News Broadsheet",
      taglineGu: "સાપ્તાહિક રવિવારીય પૂર્તિ અને સમાચાર",
      frequencyEn: "Sunday Weekly",
      frequencyGu: "રવિવારીય સાપ્તાહિક",
      establishedYear: 1939,
      primaryCity: "Mumbai",
      websiteUrl: "/about#pravasi",
      epaperUrl: "/epaper?publication=janmabhoomi-pravasi",
      logoAssetPath: "/assets/logos/janmabhoomi-pravasi-logo.svg",
      logoPlaceholderCode: "પ્રવાસી",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
    {
      id: "pub-panchang",
      code: "PAN",
      slug: "panchang",
      publicationType: PublicationType.ALMANAC,
      nameEn: "Janmabhoomi Panchang",
      nameGu: "જન્મભૂમિ પંચાંગ",
      taglineEn: "Authentic Astronomical Almanac & Traditional Hindu Calendar",
      taglineGu: "પ્રમાણભૂત ખગોળશાસ્ત્રીય વાર્ષિક પંચાંગ અને જ્યોતિષ કેલેન્ડર",
      frequencyEn: "Annual Almanac / Daily Astronomical",
      frequencyGu: "વાર્ષિક પંચાંગ / દૈનિક ગ્રહમાન",
      establishedYear: 1934,
      primaryCity: "Mumbai",
      websiteUrl: "/panchang",
      epaperUrl: "/epaper?publication=panchang",
      logoAssetPath: "/assets/logos/panchang-logo.svg",
      logoPlaceholderCode: "પંચાંગ",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.ACTIVE,
    },
    {
      id: "pub-kavita",
      code: "KAV",
      slug: "kavita",
      publicationType: PublicationType.MAGAZINE,
      nameEn: "Kavita",
      nameGu: "કવિતા",
      taglineEn: "Quarterly Gujarati Literary & Poetry Journal",
      taglineGu: "ત્રિમાસિક ગુજરાતી કાવ્ય અને સાહિત્ય સામાયિક",
      frequencyEn: "Quarterly Magazine (Once Every 3 Months)",
      frequencyGu: "ત્રિમાસિક સામાયિક (દર ત્રણ મહિને)",
      establishedYear: 1968,
      primaryCity: "Mumbai",
      websiteUrl: "/about#kavita",
      epaperUrl: "/epaper?publication=kavita",
      logoAssetPath: "/assets/logos/kavita-logo.svg",
      logoPlaceholderCode: "કવિતા",
      epaperFreePreviewPages: 0,
      status: PublicationStatus.PLANNED,
    },
  ];

  for (const pub of publications) {
    await prisma.publication.upsert({
      where: { id: pub.id },
      update: pub,
      create: pub,
    });
    console.log(`  ✓ Publication: ${pub.nameEn} (${pub.code})`);
  }

  // 2. Seed News Categories
  console.log("\n[2/5] Seeding 12 Categories...");
  const categories = [
    { id: "national", slug: "national", nameEn: "National", nameGu: "રાષ્ટ્રીય" },
    { id: "city", slug: "city", nameEn: "City", nameGu: "શહેર" },
    { id: "business", slug: "business", nameEn: "Business & Markets", nameGu: "વ્યાપાર અને બજાર" },
    { id: "sports", slug: "sports", nameEn: "Sports", nameGu: "રમતગમત" },
    { id: "entertainment", slug: "entertainment", nameEn: "Entertainment", nameGu: "મનોરંજન" },
    { id: "editorial", slug: "editorial", nameEn: "Editorial", nameGu: "અગ્રલેખ" },
    { id: "maran", slug: "maran", nameEn: "Maran (Obituary)", nameGu: "મરણ નોંધ અને બેસણું" },
    { id: "international", slug: "international", nameEn: "International", nameGu: "આંતરરાષ્ટ્રીય" },
    { id: "education", slug: "education", nameEn: "Education", nameGu: "શિક્ષણ અને યુવા" },
    { id: "religion-culture", slug: "religion-culture", nameEn: "Religion & Culture", nameGu: "ધર્મ અને સંસ્કૃતિ" },
    { id: "special-coverage", slug: "special-coverage", nameEn: "Special Coverage", nameGu: "વિશેષ કવરેજ" },
    { id: "events", slug: "events", nameEn: "Events & Forums", nameGu: "કાર્યક્રમો અને સંવાદ" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
    console.log(`  ✓ Category: ${cat.nameEn} (${cat.nameGu})`);
  }

  // 3. Seed Publication Categories for Janmabhoomi
  console.log("\n[3/5] Mapping Categories to Janmabhoomi...");
  for (let i = 0; i < categories.length; i++) {
    await prisma.publicationCategory.upsert({
      where: {
        publicationId_categoryId: {
          publicationId: "pub-janmabhoomi",
          categoryId: categories[i].id,
        },
      },
      update: { displayOrder: i + 1, isNavVisible: true },
      create: {
        publicationId: "pub-janmabhoomi",
        categoryId: categories[i].id,
        displayOrder: i + 1,
        isNavVisible: true,
      },
    });
  }

  // 4. Seed Standard RBAC Roles
  console.log("\n[4/5] Seeding Staff Roles...");
  const roles = [
    { id: "super_admin", name: "Super Administrator", description: "Global administrative access" },
    { id: "administrator", name: "Administrator", description: "Publication administrative access" },
    { id: "chief_editor", name: "Chief Editor", description: "Editorial desk leadership" },
    { id: "editor", name: "Editor", description: "Editorial review and publishing authority" },
    { id: "reporter", name: "Reporter", description: "Draft creation and bureau reporting" },
    { id: "epaper_manager", name: "E-Paper Manager", description: "Pre-press PDF ingestion and page management" },
    { id: "ad_manager", name: "Advertisement Manager", description: "Banner and campaign management" },
    { id: "support", name: "Subscriber Support", description: "Subscriber assistance read-only" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
    console.log(`  ✓ Role: ${role.name}`);
  }

  // 5. Seed Configurable Subscription Plans (Clearly labelled sample tiers)
  console.log("\n[5/5] Seeding Configurable Subscription Plans (Sample Data)...");
  const plans = [
    {
      id: "jnb_epaper_monthly_sample",
      publicationId: "pub-janmabhoomi",
      nameEn: "Sample Monthly E-Paper",
      nameGu: "નમૂના માસિક ઇ-પેપર",
      descriptionEn: "Sample monthly plan for development testing",
      descriptionGu: "ડેવલપમેન્ટ ટેસ્ટિંગ માટે નમૂના માસિક પ્લાન",
      priceInr: 75.0,
      billingInterval: BillingInterval.MONTHLY,
      durationDays: 30,
      featuresEn: ["30-day access", "All Mumbai editions", "Sample test tier"],
      featuresGu: ["૩૦ દિવસ એક્સેસ", "મુંબઈ આવૃત્તિ", "નમૂના પ્લાન"],
      isActive: true,
    },
    {
      id: "jnb_epaper_annual_sample",
      publicationId: "pub-janmabhoomi",
      nameEn: "Sample Annual E-Paper",
      nameGu: "નમૂના વાર્ષિક ઇ-પેપર",
      descriptionEn: "Sample annual plan for development testing",
      descriptionGu: "ડેવલપમેન્ટ ટેસ્ટિંગ માટે નમૂના વાર્ષિક પ્લાન",
      priceInr: 600.0,
      billingInterval: BillingInterval.ANNUAL,
      durationDays: 365,
      featuresEn: ["365-day access", "Archive access", "Sample test tier"],
      featuresGu: ["૩૬૫ દિવસ એક્સેસ", "જૂની આવૃત્તિ આર્કાઇવ", "નમૂના પ્લાન"],
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ Plan: ${plan.nameEn} (₹${plan.priceInr})`);
  }

  console.log("\n=== SEEDING COMPLETED SUCCESSFULLY ===");
  console.log("NOTE: Zero real subscriber data and zero default admin passwords created.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
