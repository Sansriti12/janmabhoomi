export type AdSlotKey =
  | "homepage_leaderboard"
  | "homepage_mid_banner"
  | "article_sidebar"
  | "epaper_sponsor"
  | "panchang_sponsor"
  | "audio_sponsor";

export interface AdCampaignSlot {
  slotKey: AdSlotKey;
  placementLabelEn: string;
  placementLabelGu: string;
  dimensionsLabel: string;
  pageLocation: string;
  monthlyEstImpressions: string;
  indicativeRateInr: number;
  active: boolean;
  isHouseAd: boolean;
  sponsorName: string;
  headlineEn: string;
  headlineGu: string;
  subtextEn: string;
  subtextGu: string;
  ctaEn: string;
  ctaGu: string;
  targetUrl: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
}

export type AdInquiryCategory = "display" | "classified" | "obituary" | "sponsored";
export type AdInquiryStatus = "new" | "contacted" | "booked" | "archived";

export interface AdInquiry {
  id: string;
  createdAt: string;
  category: AdInquiryCategory;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  selectedFormat: string;
  durationDays: number;
  includePrintCombo: boolean;
  estimatedBudgetInr: number;
  notes: string;
  status: AdInquiryStatus;
}

const CAMPAIGNS_STORAGE_KEY = "janmabhoomi_ad_campaigns_v1";
const INQUIRIES_STORAGE_KEY = "janmabhoomi_ad_inquiries_v1";
export const ADS_UPDATED_EVENT = "janmabhoomi-ads-updated";

export const DEFAULT_AD_CAMPAIGNS: Record<AdSlotKey, AdCampaignSlot> = {
  homepage_leaderboard: {
    slotKey: "homepage_leaderboard",
    placementLabelEn: "Homepage Primary Leaderboard",
    placementLabelGu: "હોમપેજ પ્રાથમિક લીડરબોર્ડ",
    dimensionsLabel: "970 × 110 px",
    pageLocation: "Homepage — Below Lead Hero",
    monthlyEstImpressions: "4.5L+ / month",
    indicativeRateInr: 45000,
    active: true,
    isHouseAd: true,
    sponsorName: "Janmabhoomi Ad Desk",
    headlineEn: "Reach 10L+ Affluent Gujarati Readers Across Mumbai, Gujarat & NRI Markets",
    headlineGu: "મુંબઈ, ગુજરાત અને વિદેશના ૧૦ લાખ+ વિશ્વસનીય વાચકો સુધી તમારી બ્રાન્ડ પહોંચાડો",
    subtextEn:
      "Print + Digital + E-Paper Advertising Solutions • Instant Rate Card & Custom Corporate Packages",
    subtextGu:
      "પ્રિન્ટ + ડિજિટલ + ઇ-પેપર જાહેરાત વિકલ્પો • ત્વરિત રેટ કાર્ડ અને કોર્પોરેટ પેકેજ",
    ctaEn: "View Media Kit & Rates",
    ctaGu: "મીડિયા કિટ અને દર જુઓ",
    targetUrl: "/advertise",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 128450,
    clicks: 2418,
  },
  homepage_mid_banner: {
    slotKey: "homepage_mid_banner",
    placementLabelEn: "Homepage Mid-Feed Spotlight Banner",
    placementLabelGu: "હોમપેજ મિડ-ફીડ સ્પોટલાઇટ બેનર",
    dimensionsLabel: "970 × 110 px",
    pageLocation: "Homepage — Between News Coverage & Events",
    monthlyEstImpressions: "3.1L+ / month",
    indicativeRateInr: 32000,
    active: true,
    isHouseAd: true,
    sponsorName: "Janmabhoomi Classifieds & Notices",
    headlineEn: "Book Public Notices, Real Estate, IPO & Besanu / Shradhanjali Ads Online",
    headlineGu: "જાહેર નોટિસ, પ્રોપર્ટી, કોર્પોરેટ અને બેસણું / શ્રદ્ધાંજલિ જાહેરાત ઓનલાઈન બુક કરો",
    subtextEn:
      "Same-day print & digital publishing across Janmabhoomi, Kutchmitra, Phulchhab & Vyapar.",
    subtextGu:
      "જન્મભૂમિ, કચ્છમિત્ર, ફૂલછાબ અને વ્યાપારમાં એક જ દિવસે પ્રિન્ટ અને ડિજિટલ પ્રકાશન.",
    ctaEn: "Book Ad / Notice Now",
    ctaGu: "જાહેરાત બુક કરો",
    targetUrl: "/advertise?tab=classified",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 84210,
    clicks: 1605,
  },
  article_sidebar: {
    slotKey: "article_sidebar",
    placementLabelEn: "Article Sidebar Banner (Sticky 300×250)",
    placementLabelGu: "લેખ સાઇડબાર સ્ટિકી જાહેરાત",
    dimensionsLabel: "300 × 250 px",
    pageLocation: "Every News Article Page — Right Sidebar",
    monthlyEstImpressions: "6.2L+ / month",
    indicativeRateInr: 38000,
    active: true,
    isHouseAd: true,
    sponsorName: "Janmabhoomi Business Desk",
    headlineEn: "Put Your Brand Next to Credible Journalism",
    headlineGu: "વિશ્વસનીય પત્રકારિતા સાથે તમારી બ્રાન્ડને જોડો",
    subtextEn:
      "High-viewability sticky right-rail placement seen by engaged Mumbai & Gujarat decision-makers.",
    subtextGu:
      "મુંબઈ અને ગુજરાતના વાચકોનું સૌથી વધુ ધ્યાન ખેંચતી સ્ટિકી સાઇડબાર જાહેરાત.",
    ctaEn: "Reserve This Slot",
    ctaGu: "આ સ્લોટ બુક કરો",
    targetUrl: "/advertise?slot=article_sidebar",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 214900,
    clicks: 4120,
  },
  epaper_sponsor: {
    slotKey: "epaper_sponsor",
    placementLabelEn: "E-Paper Reader Top Sponsor Strip",
    placementLabelGu: "ઇ-પેપર રીડર ટોપ સ્પોન્સર પટ્ટી",
    dimensionsLabel: "728 × 60 px",
    pageLocation: "E-Paper Catalog & Broadsheet Reader Header",
    monthlyEstImpressions: "2.8L+ / month (18 min avg session)",
    indicativeRateInr: 55000,
    active: true,
    isHouseAd: true,
    sponsorName: "Saurashtra Trust E-Paper Partner",
    headlineEn: "Sponsor Today's Digital Broadsheet — 18+ Min Average Reader Time",
    headlineGu: "આજના ડિજિટલ ઇ-પેપરના પ્રાયોજક બનો — ૧૮+ મિનિટ વાંચન સમય",
    subtextEn: "Exclusive 'Presented By' branding across all 12 broadsheet pages.",
    subtextGu: "તમામ ૧૨ બ્રોડશીટ પાના પર વિશિષ્ટ 'પ્રસ્તુતકર્તા' બ્રાન્ડિંગ.",
    ctaEn: "Sponsor E-Paper",
    ctaGu: "ઇ-પેપર સ્પોન્સર કરો",
    targetUrl: "/advertise?slot=epaper_sponsor",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 96300,
    clicks: 1940,
  },
  panchang_sponsor: {
    slotKey: "panchang_sponsor",
    placementLabelEn: "Daily Panchang 'Powered By' Slot",
    placementLabelGu: "દૈનિક પંચાંગ 'પ્રસ્તુતકર્તા' સ્લોટ",
    dimensionsLabel: "468 × 60 px",
    pageLocation: "Homepage & Panchang Page — Daily Widget",
    monthlyEstImpressions: "2.2L+ / month",
    indicativeRateInr: 25000,
    active: true,
    isHouseAd: true,
    sponsorName: "Available for Jewellery / Real Estate / Trust",
    headlineEn: "Panchang Sponsorship Open",
    headlineGu: "પંચાંગ સ્પોન્સરશિપ ઉપલબ્ધ",
    subtextEn: "Ideal for Jewellers, Developers, Hospitality & Astrology Brands",
    subtextGu: "જ્વેલર્સ, બિલ્ડર્સ અને શુભ પ્રસંગોની બ્રાન્ડ માટે ઉત્તમ",
    ctaEn: "Sponsor Panchang",
    ctaGu: "પ્રાયોજક બનો",
    targetUrl: "/advertise?slot=panchang_sponsor",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 71500,
    clicks: 1380,
  },
  audio_sponsor: {
    slotKey: "audio_sponsor",
    placementLabelEn: "2-Minute Audio Bulletin 'Presented By'",
    placementLabelGu: "૨-મિનિટ ઓડિયો બુલેટિન પ્રાયોજક",
    dimensionsLabel: "Hero Card Sponsor Badge",
    pageLocation: "Homepage Right Hero — Audio Bulletin Card",
    monthlyEstImpressions: "1.9L+ / month",
    indicativeRateInr: 30000,
    active: true,
    isHouseAd: true,
    sponsorName: "Audio Bulletin Partner Slot",
    headlineEn: "Sponsor the Daily Audio Bulletin",
    headlineGu: "દૈનિક ઓડિયો બુલેટિન સ્પોન્સર કરો",
    subtextEn: "Exclusive 'Presented By' visual brand strip inside the hero Audio Bulletin card.",
    subtextGu: "હોમપેજ ઓડિયો બુલેટિન કાર્ડમાં વિશિષ્ટ 'પ્રસ્તુતકર્તા' બ્રાન્ડિંગ પટ્ટી.",
    ctaEn: "Partner With Us",
    ctaGu: "ભાગીદાર બનો",
    targetUrl: "/advertise?slot=audio_sponsor",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    impressions: 64800,
    clicks: 1120,
  },
};

export const DEFAULT_AD_INQUIRIES: AdInquiry[] = [
  {
    id: "inq-1001",
    createdAt: "2026-11-22T11:20:00+05:30",
    category: "display",
    name: "Ketanbhai Zaveri",
    company: "Zaveri Heritage Jewellers, Zaveri Bazaar",
    phone: "+91 98201 44510",
    email: "marketing@zaveriheritage.in",
    city: "Mumbai",
    selectedFormat: "Homepage Leaderboard + Panchang Sponsorship",
    durationDays: 30,
    includePrintCombo: true,
    estimatedBudgetInr: 95000,
    notes: "Interested in wedding season Print + Digital combo for Mumbai & Surat editions.",
    status: "new",
  },
  {
    id: "inq-1002",
    createdAt: "2026-11-21T16:45:00+05:30",
    category: "classified",
    name: "Adv. Rajesh Mehta",
    company: "Mehta & Associates Legal",
    phone: "+91 98210 77823",
    email: "rajesh@mehtalegal.co.in",
    city: "Mumbai",
    selectedFormat: "Public & Legal Notice (Print + Digital)",
    durationDays: 3,
    includePrintCombo: true,
    estimatedBudgetInr: 14500,
    notes: "Urgent property title clearance public notice for Fort/Colaba.",
    status: "contacted",
  },
  {
    id: "inq-1003",
    createdAt: "2026-11-20T09:15:00+05:30",
    category: "sponsored",
    name: "Nidhi Patel",
    company: "Saurashtra Infra Developers",
    phone: "+91 98982 31094",
    email: "nidhi@saurashtrainfra.com",
    city: "Rajkot",
    selectedFormat: "E-Paper Top Sponsor + Branded Spotlight Article",
    durationDays: 15,
    includePrintCombo: true,
    estimatedBudgetInr: 82000,
    notes: "New township launch targeting Mumbai & NRI Gujarati investors.",
    status: "booked",
  },
];

export function loadAdCampaigns(): Record<AdSlotKey, AdCampaignSlot> {
  if (typeof window === "undefined") return DEFAULT_AD_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (!raw) return DEFAULT_AD_CAMPAIGNS;
    const parsed = JSON.parse(raw) as Partial<Record<AdSlotKey, AdCampaignSlot>>;
    return {
      ...DEFAULT_AD_CAMPAIGNS,
      ...parsed,
    };
  } catch {
    return DEFAULT_AD_CAMPAIGNS;
  }
}

export function saveAdCampaigns(campaigns: Record<AdSlotKey, AdCampaignSlot>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    window.dispatchEvent(new Event(ADS_UPDATED_EVENT));
  } catch {}
}

export function trackAdClick(slotKey: AdSlotKey): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAdCampaigns();
    const slot = all[slotKey];
    if (!slot) return;
    all[slotKey] = {
      ...slot,
      clicks: (slot.clicks || 0) + 1,
    };
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function trackAdImpression(slotKey: AdSlotKey): void {
  if (typeof window === "undefined") return;
  try {
    const sessionKey = `jb_imp_${slotKey}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    const all = loadAdCampaigns();
    const slot = all[slotKey];
    if (!slot) return;
    all[slotKey] = {
      ...slot,
      impressions: (slot.impressions || 0) + 1,
    };
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function loadAdInquiries(): AdInquiry[] {
  if (typeof window === "undefined") return DEFAULT_AD_INQUIRIES;
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (!raw) return DEFAULT_AD_INQUIRIES;
    const parsed = JSON.parse(raw) as AdInquiry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AD_INQUIRIES;
  } catch {
    return DEFAULT_AD_INQUIRIES;
  }
}

export function saveAdInquiries(inquiries: AdInquiry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
    window.dispatchEvent(new Event(ADS_UPDATED_EVENT));
  } catch {}
}

export function addAdInquiry(
  inquiry: Omit<AdInquiry, "id" | "createdAt" | "status">
): AdInquiry {
  const existing = loadAdInquiries();
  const created: AdInquiry = {
    ...inquiry,
    id: `inq-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  saveAdInquiries([created, ...existing]);
  return created;
}
