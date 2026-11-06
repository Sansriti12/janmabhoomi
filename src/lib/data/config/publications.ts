import { Publication } from "../types";

/**
 * Centralized Publication & Product Registry
 * Saurashtra Trust Multi-Publication Platform
 * 
 * Configures all 8 historic publications, periodicals, magazines and almanac products
 * across the Saurashtra Trust network:
 * 1. Janmabhoomi (Daily Broadsheet - Evening)
 * 2. Kutchmitra (Daily Morning)
 * 3. Phulchhab (Daily Morning)
 * 4. Vyapar Gujarati (Bi-Weekly Financial)
 * 5. Vyapar Hindi (Weekly Financial)
 * 6. Janmabhoomi Pravasi (Sunday Weekly)
 * 7. Panchang (Authentic Annual Almanac & Daily Astronomical Calendar)
 * 8. Kavita (Quarterly Poetry & Literary Magazine)
 * 
 * Official external URLs verified against approved management document:
 * "Janmabhoomi Group_About_Content_Website_Gujarati.docx"
 */
export const PUBLICATIONS_CONFIG: Record<string, Publication> = {
  janmabhoomi: {
    id: "pub-janmabhoomi",
    name: { en: "Janmabhoomi", gu: "જન્મભૂમિ" },
    slug: "janmabhoomi",
    publicationType: "daily_newspaper",
    tagline: {
      en: "News • Trust • Impartiality",
      gu: "સમાચાર • વિશ્વાસ • નિષ્પક્ષતા",
    },
    logo: "/assets/logos/janmabhoomi-logo.svg",
    logoPlaceholderCode: "જન્મભૂમિ",
    websiteUrl: "/",
    epaperUrl: "/epaper",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Daily Broadsheet (Evening)", gu: "દૈનિક સાંધ્ય સમાચારપત્ર" },
    establishedYear: "1934",
    region: { en: "Mumbai & Maharashtra", gu: "મુંબઈ અને મહારાષ્ટ્ર" },
    status: "active",
  },
  kutchmitra: {
    id: "pub-kutchmitra",
    name: { en: "Kutchmitra", gu: "કચ્છમિત્ર" },
    slug: "kutchmitra",
    publicationType: "daily_newspaper",
    tagline: {
      en: "The Authentic Voice of Kutch",
      gu: "કચ્છનું વિશ્વાસપાત્ર દૈનિક",
    },
    logo: "/assets/logos/kutchmitra-logo.svg",
    logoPlaceholderCode: "કચ્છમિત્ર",
    websiteUrl: "https://www.kutchmitradaily.com",
    epaperUrl: "/epaper?publication=kutchmitra",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Daily Morning", gu: "દૈનિક પ્રભાત" },
    establishedYear: "1947",
    region: { en: "Bhuj, Kutch & Saurashtra", gu: "ભુજ, કચ્છ અને સૌરાષ્ટ્ર" },
    status: "active",
    isPlaceholderAsset: false,
  },
  phulchhab: {
    id: "pub-phulchhab",
    name: { en: "Phulchhab", gu: "ફૂલછાબ" },
    slug: "phulchhab",
    publicationType: "daily_newspaper",
    tagline: {
      en: "Saurashtra's Leading Daily Since 1921",
      gu: "સૌરાષ્ટ્રનું અગ્રણી દૈનિક",
    },
    logo: "/assets/logos/phulchhab-logo.svg",
    logoPlaceholderCode: "ફૂલછાબ",
    websiteUrl: "https://www.phulchhab.com",
    epaperUrl: "/epaper?publication=phulchhab",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Daily Morning", gu: "દૈનિક પ્રભાત" },
    establishedYear: "1921",
    region: { en: "Rajkot & Entire Saurashtra", gu: "રાજકોટ અને સમગ્ર સૌરાષ્ટ્ર" },
    status: "active",
    isPlaceholderAsset: false,
  },
  "vyapar-gujarati": {
    id: "pub-vyapar-gu",
    name: { en: "Vyapar (Gujarati)", gu: "વ્યાપાર (ગુજરાતી)" },
    slug: "vyapar-gujarati",
    publicationType: "biweekly_newspaper",
    tagline: {
      en: "India's Premier Financial Bi-Weekly",
      gu: "ભારતનું પ્રથમ આર્થિક દ્વિ-સાપ્તાહિક",
    },
    logo: "/assets/logos/vyapar-logo.svg",
    logoPlaceholderCode: "વ્યાપાર",
    websiteUrl: "https://vyapar.janmabhoominewspapers.com",
    epaperUrl: "/epaper?publication=vyapar-gujarati",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Bi-Weekly (Wed & Sat)", gu: "દ્વિ-સાપ્તાહિક (બુધ અને શનિ)" },
    establishedYear: "1949",
    region: { en: "Pan-India Commercial Centers", gu: "સમગ્ર ભારત વેપારી કેન્દ્રો" },
    status: "active",
    isPlaceholderAsset: false,
  },
  "vyapar-hindi": {
    id: "pub-vyapar-hi",
    name: { en: "Vyapar (Hindi)", gu: "વ્યાપાર (હિન્દી)" },
    slug: "vyapar-hindi",
    publicationType: "weekly_newspaper",
    tagline: {
      en: "National Financial & Commodity Intelligence",
      gu: "રાષ્ટ્રીય આર્થિક અને કોમોડિટી સમાચાર",
    },
    logo: "/assets/logos/vyapar-hindi-logo.svg",
    logoPlaceholderCode: "व्यापार",
    websiteUrl: "https://vyaparhindi.com",
    epaperUrl: "/epaper?publication=vyapar-hindi",
    defaultLanguage: "en",
    supportedLanguages: ["en", "gu"],
    frequency: { en: "Weekly Financial", gu: "સાપ્તાહિક આર્થિક" },
    establishedYear: "1987",
    region: { en: "National Commercial Hubs", gu: "રાષ્ટ્રીય વાણિજ્યિક કેન્દ્રો" },
    status: "active",
    isPlaceholderAsset: false,
  },
  "janmabhoomi-pravasi": {
    id: "pub-pravasi",
    name: { en: "Janmabhoomi Pravasi", gu: "જન્મભૂમિ પ્રવાસી" },
    slug: "janmabhoomi-pravasi",
    publicationType: "weekly_newspaper",
    tagline: {
      en: "The Sunday Weekly Literary & News Broadsheet",
      gu: "સાપ્તાહિક રવિવારીય પૂર્તિ અને સમાચાર",
    },
    logo: "/assets/logos/janmabhoomi-pravasi-logo.svg",
    logoPlaceholderCode: "પ્રવાસી",
    websiteUrl: "https://pravasi.janmabhoominewspapers.com",
    epaperUrl: "/epaper?publication=janmabhoomi-pravasi",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Sunday Weekly", gu: "રવિવારીય સાપ્તાહિક" },
    establishedYear: "1939",
    region: { en: "Mumbai & Global Diaspora", gu: "મુંબઈ અને વૈશ્વિક ગુજરાતી સમાજ" },
    status: "active",
    isPlaceholderAsset: false,
  },
  panchang: {
    id: "pub-panchang",
    name: { en: "Janmabhoomi Panchang", gu: "જન્મભૂમિ પંચાંગ" },
    slug: "panchang",
    publicationType: "almanac",
    tagline: {
      en: "Authentic Astronomical Almanac & Traditional Hindu Calendar",
      gu: "પ્રમાણભૂત ખગોળશાસ્ત્રીય વાર્ષિક પંચાંગ અને જ્યોતિષ કેલેન્ડર",
    },
    logo: "/assets/logos/panchang-logo.svg",
    logoPlaceholderCode: "પંચાંગ",
    websiteUrl: "/panchang",
    epaperUrl: "/epaper?publication=panchang",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Annual Almanac / Daily Astronomical", gu: "વાર્ષિક પંચાંગ / દૈનિક ગ્રહમાન" },
    establishedYear: "1934",
    region: { en: "Pan-India & Global Diaspora", gu: "સમગ્ર ભારત અને દેશ-વિદેશ" },
    status: "active",
    isPlaceholderAsset: false,
  },
  kavita: {
    id: "pub-kavita",
    name: { en: "Kavita", gu: "કવિતા" },
    slug: "kavita",
    publicationType: "magazine",
    tagline: {
      en: "Quarterly Gujarati Literary & Poetry Journal",
      gu: "ત્રિમાસિક ગુજરાતી કાવ્ય અને સાહિત્ય સામાયિક",
    },
    logo: "/assets/logos/kavita-logo.svg",
    logoPlaceholderCode: "કવિતા",
    websiteUrl: "/about#kavita",
    epaperUrl: "/epaper?publication=kavita",
    defaultLanguage: "gu",
    supportedLanguages: ["gu", "en"],
    frequency: { en: "Quarterly Magazine (Once Every 3 Months)", gu: "ત્રિમાસિક સામાયિક (દર ત્રણ મહિને)" },
    establishedYear: "1968",
    region: { en: "Pan-India Literary Circles & Diaspora", gu: "સમગ્ર ભારત અને વૈશ્વિક સાહિત્ય રસિકો" },
    status: "active",
    isPlaceholderAsset: false,
  },
};

export const ACTIVE_PUBLICATION_ID = "pub-janmabhoomi";

export function getActivePublication(): Publication {
  return PUBLICATIONS_CONFIG.janmabhoomi;
}

export function getAllPublications(): Publication[] {
  return Object.values(PUBLICATIONS_CONFIG);
}

export function getPublicationBySlug(slug: string): Publication | undefined {
  return Object.values(PUBLICATIONS_CONFIG).find((p) => p.slug === slug);
}
