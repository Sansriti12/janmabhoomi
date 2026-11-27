import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./services/passwordService.js";

/**
 * Idempotent Cloud DB Bootstrap
 * Runs safely on every startup so a brand-new cloud PostgreSQL database (Render / Railway)
 * immediately has the 4 active publications, core categories, bilingual hotspot columns,
 * and an initial Newsroom Admin account without requiring manual SQL commands.
 */
export async function bootstrapCloudDatabase(prisma: PrismaClient, log?: any): Promise<void> {
  try {
    // 1. Ensure bilingual hotspot columns exist on epaper_hotspots
    await prisma.$executeRawUnsafe(`
      ALTER TABLE epaper_hotspots
        ADD COLUMN IF NOT EXISTS sub_headline_text TEXT,
        ADD COLUMN IF NOT EXISTS body_text TEXT,
        ADD COLUMN IF NOT EXISTS headline_en TEXT,
        ADD COLUMN IF NOT EXISTS sub_headline_en TEXT,
        ADD COLUMN IF NOT EXISTS body_text_en TEXT;
    `);

    // 2. Ensure the 4 active Saurashtra Trust publications exist
    const corePubs = [
      {
        id: "pub-janmabhoomi",
        code: "JB",
        slug: "janmabhoomi",
        nameEn: "Janmabhoomi",
        nameGu: "જન્મભૂમિ",
        publicationType: "DAILY_NEWSPAPER" as const,
        taglineEn: "News • Trust • Impartiality",
        taglineGu: "સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
        frequencyEn: "Daily Broadsheet (Evening)",
        frequencyGu: "દૈનિક સાંધ્ય સમાચારપત્ર",
        establishedYear: 1934,
        primaryCity: "Mumbai",
        websiteUrl: "https://janmabhoomi-dun.vercel.app",
        epaperUrl: "https://janmabhoomi-dun.vercel.app/epaper",
        logoPlaceholderCode: "જન્મભૂમિ",
        status: "ACTIVE" as const,
        epaperFreePreviewPages: 2,
      },
      {
        id: "pub-pravasi",
        code: "JP",
        slug: "janmabhoomi-pravasi",
        nameEn: "Janmabhoomi Pravasi",
        nameGu: "જન્મભૂમિ પ્રવાસી",
        publicationType: "WEEKLY_NEWSPAPER" as const,
        taglineEn: "Sunday Weekly Newspaper",
        taglineGu: "સાપ્તાહિક રવિવારીય અખબાર",
        frequencyEn: "Sunday Weekly",
        frequencyGu: "રવિવારીય સાપ્તાહિક",
        establishedYear: 1939,
        primaryCity: "Mumbai",
        websiteUrl: "https://janmabhoomi-pravasi.vercel.app",
        epaperUrl: "https://janmabhoomi-pravasi.vercel.app/epaper",
        logoPlaceholderCode: "પ્રવાસી",
        status: "ACTIVE" as const,
        epaperFreePreviewPages: 2,
      },
      {
        id: "pub-purti",
        code: "JPT",
        slug: "janmabhoomi-purti",
        nameEn: "Janmabhoomi Purti",
        nameGu: "જન્મભૂમિ પૂર્તિ",
        publicationType: "MAGAZINE" as const,
        taglineEn: "Special Weekly Supplements",
        taglineGu: "વિશેષ સાપ્તાહિક પૂર્તિઓ",
        frequencyEn: "Weekly Supplement",
        frequencyGu: "સાપ્તાહિક પૂર્તિ",
        establishedYear: 1950,
        primaryCity: "Mumbai",
        websiteUrl: "https://janmabhoomi-dun.vercel.app",
        epaperUrl: "https://janmabhoomi-dun.vercel.app/epaper",
        logoPlaceholderCode: "પૂર્તિ",
        status: "ACTIVE" as const,
        epaperFreePreviewPages: 2,
      },
      {
        id: "pub-madhuvan",
        code: "MDH",
        slug: "madhuvan",
        nameEn: "Madhuvan",
        nameGu: "મધુવન",
        publicationType: "MAGAZINE" as const,
        taglineEn: "Sunday Magazine Supplement",
        taglineGu: "રવિવારીય મધુવન પૂર્તિ",
        frequencyEn: "Sunday Supplement",
        frequencyGu: "રવિવારીય પૂર્તિ",
        establishedYear: 1955,
        primaryCity: "Mumbai",
        websiteUrl: "https://janmabhoomi-pravasi.vercel.app",
        epaperUrl: "https://janmabhoomi-pravasi.vercel.app/epaper",
        logoPlaceholderCode: "મધુવન",
        status: "ACTIVE" as const,
        epaperFreePreviewPages: 2,
      },
    ];

    for (const pub of corePubs) {
      await prisma.publication.upsert({
        where: { id: pub.id },
        update: { status: "ACTIVE" },
        create: pub,
      });
    }

    // 3. Ensure core news categories exist
    const coreCategories = [
      { id: "cat-national", slug: "national", nameEn: "National", nameGu: "રાષ્ટ્રીય" },
      { id: "cat-city", slug: "city", nameEn: "City", nameGu: "શહેર" },
      { id: "cat-business", slug: "business", nameEn: "Business", nameGu: "વ્યાપાર" },
      { id: "cat-sports", slug: "sports", nameEn: "Sports", nameGu: "રમતગમત" },
      { id: "cat-entertainment", slug: "entertainment", nameEn: "Entertainment", nameGu: "મનોરંજન" },
      { id: "cat-editorial", slug: "editorial", nameEn: "Editorial", nameGu: "અગ્રલેખ" },
      { id: "cat-maran", slug: "maran", nameEn: "Obituaries", nameGu: "મરણ નોંધ" },
      { id: "cat-madhuvan", slug: "madhuvan", nameEn: "Madhuvan", nameGu: "મધુવન" },
      { id: "cat-sahitya", slug: "sahitya", nameEn: "Literature & Arts", nameGu: "સાહિત્ય અને કલા" },
      { id: "cat-culture", slug: "culture", nameEn: "Culture & Heritage", nameGu: "ધર્મ-સંસ્કૃતિ" },
      { id: "cat-purti", slug: "purti", nameEn: "Sunday Purti", nameGu: "રવિવારીય પૂર્તિ" },
    ];

    for (const cat of coreCategories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    // 4. Ensure super_admin role & initial admin staff user exist on fresh DB
    await prisma.role.upsert({
      where: { id: "super_admin" },
      update: {},
      create: {
        id: "super_admin",
        name: "Super Administrator",
        description: "Global administrative access",
      },
    });

    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@janmabhoomi.in").toLowerCase();
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456";
      const passwordHash = await hashPassword(initialPassword);
      const created = await prisma.user.create({
        data: {
          email: adminEmail,
          fullName: "System Admin",
          passwordHash,
          isStaff: true,
          status: "ACTIVE",
        },
      });
      await prisma.userRole.create({
        data: {
          userId: created.id,
          roleId: "super_admin",
        },
      });
      log?.info(`Bootstrapped initial admin user: ${adminEmail}`);
    }
  } catch (err) {
    log?.warn({ err }, "Cloud DB bootstrap check encountered a non-fatal warning");
  }
}
