import {
  NewsArticle,
  EditorialArticle,
  SpecialEventItem,
  PanchangData,
  SisterPublication,
  AdvertisementSlot,
  CategorySlug,
  BilingualText,
} from "../types";

export const CATEGORY_METADATA: Record<
  CategorySlug,
  { title: BilingualText; description: BilingualText }
> = {
  national: {
    title: { en: "National", gu: "રાષ્ટ્રીય" },
    description: {
      en: "Policy decisions, parliamentary coverage, and major developments across India.",
      gu: "ભારતભરના મહત્વપૂર્ણ નીતિગત નિર્ણયો, સંસદીય સમાચાર અને રાષ્ટ્રીય ઘટનાક્રમ.",
    },
  },
  city: {
    title: { en: "City (Mumbai & Gujarat)", gu: "શહેર (મુંબઈ અને ગુજરાત)" },
    description: {
      en: "Civic infrastructure, metro updates, and local reporting from Mumbai, Ahmedabad, Surat, and Rajkot.",
      gu: "મુંબઈ, અમદાવાદ, સુરત અને રાજકોટ સહિતના શહેરોના સ્થાનિક અને નાગરિક સમાચાર.",
    },
  },
  business: {
    title: { en: "Business & Markets", gu: "વ્યાપાર અને બજાર" },
    description: {
      en: "Stock markets, trade policy, MSME insights, and industrial coverage.",
      gu: "શેરબજાર, વેપાર નીતિ, ઉદ્યોગ જગત અને આર્થિક વિશ્લેષણ.",
    },
  },
  sports: {
    title: { en: "Sports", gu: "રમતગમત" },
    description: {
      en: "Cricket, domestic tournaments, Olympic athletics, and match analysis.",
      gu: "ક્રિકેટ, સ્થાનિક ટૂર્નામેન્ટ્સ અને આંતરરાષ્ટ્રીય રમતગમત જગતના સમાચાર.",
    },
  },
  entertainment: {
    title: { en: "Entertainment & Arts", gu: "મનોરંજન અને કલા" },
    description: {
      en: "Gujarati theatre, cinema, literature festivals, and cultural reviews.",
      gu: "ગુજરાતી રંગભૂમિ, સિનેમા, સાહિત્ય અને સાંસ્કૃતિક સમીક્ષા.",
    },
  },
  editorial: {
    title: { en: "Editorial (અગ્રલેખ)", gu: "અગ્રલેખ અને વિચાર" },
    description: {
      en: "Institutional editorials and expert columns from the Janmabhoomi editorial board.",
      gu: "જન્મભૂમિ સંપાદકીય મંડળના સત્તાવાર અગ્રલેખ અને નિષ્ણાત કટારલેખકોના વિચારો.",
    },
  },
  maran: {
    title: { en: "Maran (Obituary Notices)", gu: "મરણ નોંધ અને બેસણું" },
    description: {
      en: "Community obituary notices, Besanu announcements, and tributes published in Janmabhoomi.",
      gu: "જન્મભૂમિમાં પ્રકાશિત થતી અવસાન નોંધ, બેસણું અને શ્રદ્ધાંજલિ વિભાગ.",
    },
  },
  international: {
    title: { en: "International", gu: "આંતરરાષ્ટ્રીય" },
    description: {
      en: "Global diplomacy, diaspora affairs, and world news.",
      gu: "વૈશ્વિક રાજદ્વારી, વિદેશમાં વસતા ભારતીયો અને આંતરરાષ્ટ્રીય સમાચાર.",
    },
  },
  education: {
    title: { en: "Education & Youth", gu: "શિક્ષણ અને યુવા" },
    description: {
      en: "University updates, board examinations, and academic policy reforms.",
      gu: "યુનિવર્સિટી, બોર્ડ પરીક્ષાઓ અને નવી શિક્ષણ નીતિ અંગેના સમાચાર.",
    },
  },
  "religion-culture": {
    title: { en: "Religion & Culture", gu: "ધર્મ અને સંસ્કૃતિ" },
    description: {
      en: "Heritage preservation, festivals, philosophical discourses, and cultural traditions.",
      gu: "ભારતીય સંસ્કૃતિ, તહેવારો, આધ્યાત્મિક ચિંતન અને વારસો.",
    },
  },
  "special-coverage": {
    title: { en: "Special Coverage", gu: "વિશેષ કવરેજ" },
    description: {
      en: "Multi-part investigative series and special editorial dossiers.",
      gu: "વિશેષ સંશોધનાત્મક અહેવાલો અને ગ્રાઉન્ડ રિપોર્ટિંગ શ્રેણી.",
    },
  },
  events: {
    title: { en: "Events & Forums", gu: "કાર્યક્રમો અને સંવાદ" },
    description: {
      en: "Conclaves, literary awards, and reader forums organised by Janmabhoomi Group.",
      gu: "જન્મભૂમિ જૂથ દ્વારા આયોજિત સાહિત્યિક, સાંસ્કૃતિક અને નાગરિક સંવાદ કાર્યક્રમો.",
    },
  },
};

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: "jb-lead-01",
    slug: "western-india-maritime-freight-corridor-expansion-plan",
    category: "national",
    categoryLabel: { en: "National", gu: "રાષ્ટ્રીય" },
    title: {
      en: "Western Maritime & Dedicated Rail Corridor Enters Final Phase Linking Mumbai Ports with Gujarat Industrial Hubs",
      gu: "મુંબઈ બંદરોને ગુજરાતના ઔદ્યોગિક કેન્દ્રો સાથે જોડતો વેસ્ટર્ન મેરિટાઇમ અને રેલ કોરિડોર અંતિમ તબક્કામાં",
    },
    subtitle: {
      en: "New multimodal logistics synchronization aims to cut cargo transit time by 38% across Maharashtra and Saurashtra-Kutch ports.",
      gu: "નવી મલ્ટિમોડલ લોજિસ્ટિક્સ વ્યવસ્થાથી મહારાષ્ટ્ર અને સૌરાષ્ટ્ર-કચ્છના બંદરો વચ્ચે માલપરિવહન સમયમાં ૩૮% ઘટાડો થવાનો અંદાજ.",
    },
    summary: {
      en: "[DEMO DATA] Senior ministry officials and port authorities finalized the operational blueprint for unified freight clearance between JNPT Mumbai, Hazira, and Kandla.",
      gu: "[ડેમો ડેટા] મુંબઈના જેએનપીટી, હજીરા અને કંડલા વચ્ચે એકીકૃત માલપરિવહન ક્લિયરન્સ માટે વરિષ્ઠ અધિકારીઓએ અંતિમ રૂપરેખા તૈયાર કરી છે.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI / GANDHINAGAR (Demonstration Report): In a landmark infrastructure coordination drive between Maharashtra and Gujarat, authorities have completed the final signalling and customs integration trial along the Western Dedicated Freight and Coastal Corridor.",
        "Speaking at the joint maritime review meeting at Nariman Point, infrastructure planners confirmed that dedicated feeder loops connecting textile, engineering, and agricultural clusters in Surat, Bharuch, and Rajkot will begin scheduled commercial operations next quarter.",
        "Complete port-by-port capital outlay tables, exporter tariff revisions, and exclusive interviews with shipping chamber representatives are published in today's 16-page Janmabhoomi print and E-Paper edition.",
      ],
      gu: [
        "મુંબઈ / ગાંધીનગર (નિદર્શન અહેવાલ): મહારાષ્ટ્ર અને ગુજરાત વચ્ચેના મહત્વપૂર્ણ માળખાકીય સંકલનના ભાગરૂપે વેસ્ટર્ન ડેડિકેટેડ ફ્રેઇટ અને કોસ્ટલ કોરિડોર પર અંતિમ સિગ્નલિંગ અને કસ્ટમ્સ ટ્રાયલ પૂર્ણ કરવામાં આવી છે.",
        "નરીમાન પોઈન્ટ ખાતે યોજાયેલી સંયુક્ત સમીક્ષા બેઠકમાં અધિકારીઓએ જણાવ્યું હતું કે સુરત, ભરૂચ અને રાજકોટના ઔદ્યોગિક એકમોને જોડતી વિશેષ ફીડર લાઇન આગામી ત્રિમાસિક ગાળાથી કાર્યરત થશે.",
        "આ યોજનાના સંપૂર્ણ આંકડા, નિકાસકારો માટેના નવા દર અને વેપારી મંડળોના વિશેષ પ્રતિભાવો આજના જન્મભૂમિ દૈનિકના પાના નં. ૧ અને ૯ પર ઈ-પેપરમાં પ્રકાશિત કરવામાં આવ્યા છે.",
      ],
    },
    author: { en: "Janmabhoomi Economic Bureau", gu: "જન્મભૂમિ આર્થિક બ્યુરો" },
    location: { en: "Mumbai / Gandhinagar", gu: "મુંબઈ / ગાંધીનગર" },
    publishedAt: "2026-11-03T07:30:00+05:30",
    readTimeMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    imageCaption: {
      en: "Demonstration Image: Container terminal operations along the western coastal corridor.",
      gu: "નિદર્શન તસવીર: પશ્ચિમ દરિયાકાંઠાના કોરિડોર પર કન્ટેનર ટર્મિનલની કામગીરી.",
    },
    isBreaking: true,
    isLeadStory: true,
    epaperPageNumber: 1,
    epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-sublead-01",
    slug: "mumbai-coastal-metro-interchange-commuter-review",
    category: "city",
    categoryLabel: { en: "City", gu: "શહેર" },
    title: {
      en: "South Mumbai Suburban & Metro Interchange Records 2.4 Lakh Daily Commuters in First Month",
      gu: "દક્ષિણ મુંબઈ સબર્બન અને મેટ્રો ઇન્ટરચેન્જ પર પ્રથમ મહિનામાં દૈનિક ૨.૪ લાખ મુસાફરોની નોંધ",
    },
    summary: {
      en: "[DEMO DATA] Pedestrian dispersal tunnels at Churchgate and Hutatma Chowk ease peak-hour congestion across the Fort heritage precinct.",
      gu: "[ડેમો ડેટા] ચર્ચગેટ અને હુતાત્મા ચોક ખાતે નવા અંડરપાસથી ફોર્ટ વિસ્તારમાં પીક-અવર ટ્રાફિકમાં મોટી રાહત.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): Urban transport planners released the first 30-day ridership audit showing a substantial shift from private taxis to underground metro links across South Mumbai's commercial district.",
        "Read the ward-wise traffic impact map and commuter association feedback in today's Janmabhoomi City Supplement via E-Paper.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): દક્ષિણ મુંબઈના વ્યાપારી વિસ્તારોમાં ભૂગર્ભ મેટ્રો શરૂ થયા બાદ પ્રથમ ૩૦ દિવસના મુસાફર આંકડા જાહેર કરવામાં આવ્યા છે.",
        "સંપૂર્ણ ટ્રાફિક વિશ્લેષણ અને નાગરિકોના પ્રતિભાવો આજના જન્મભૂમિ ઈ-પેપરના પાના નં. ૩ પર વાંચો.",
      ],
    },
    author: { en: "Civic Correspondent", gu: "નાગરિક પ્રતિનિધિ" },
    location: { en: "Fort, Mumbai", gu: "ફોર્ટ, મુંબઈ" },
    publishedAt: "2026-11-03T08:15:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Heritage precinct and urban transit hub in South Mumbai.",
      gu: "નિદર્શન તસવીર: દક્ષિણ મુંબઈનો હેરિટેજ અને ટ્રાન્ઝિટ વિસ્તાર.",
    },
    isBreaking: true,
    isSubLead: true,
    epaperPageNumber: 3,
    epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-sublead-02",
    slug: "rbi-msme-export-credit-settlement-framework",
    category: "business",
    categoryLabel: { en: "Business", gu: "વ્યાપાર" },
    title: {
      en: "RBI Unveils Streamlined Trade Credit Norms for Gem, Textile and Engineering Exporters",
      gu: "રિઝર્વ બેંક દ્વારા જેમ્સ, ટેક્સટાઇલ અને એન્જિનિયરિંગ નિકાસકારો માટે સરળ ટ્રેડ ક્રેડિટ નિયમો જાહેર",
    },
    summary: {
      en: "[DEMO DATA] Revised working-capital settlement cycles expected to benefit mid-sized export houses in Mumbai and Surat.",
      gu: "[ડેમો ડેટા] કાર્યકારી મૂડીના નવા નિયમોથી મુંબઈ અને સુરતના મધ્યમ કદના નિકાસકારોને સીધો લાભ મળશે.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): The Reserve Bank of India introduced simplified documentation for export credit refinancing, addressing longstanding representations from MSME trade bodies.",
        "Detailed circular analysis by chartered accountants appears in the Vyapar & Business section of today's Janmabhoomi E-Paper.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): ભારતીય રિઝર્વ બેંકે નાના અને મધ્યમ નિકાસકારો માટે ધિરાણ પ્રક્રિયા સરળ બનાવતા નવા દિશાનિર્દેશો જારી કર્યા છે.",
        "આ પરિપત્રનું ઊંડાણપૂર્વકનું વિશ્લેષણ આજના જન્મભૂમિ ઈ-પેપરના વ્યાપાર પાના પર વાંચો.",
      ],
    },
    author: { en: "Financial Desk", gu: "વ્યાપાર ડેસ્ક" },
    location: { en: "Mumbai", gu: "મુંબઈ" },
    publishedAt: "2026-11-03T09:00:00+05:30",
    readTimeMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Financial district skyline.",
      gu: "નિદર્શન તસવીર: નાણાકીય કેન્દ્ર મુંબઈ.",
    },
    isBreaking: true,
    isSubLead: true,
    epaperPageNumber: 10,
    epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-brief-01",
    slug: "saurashtra-groundnut-procurement-centres-record-arrivals",
    category: "city",
    categoryLabel: { en: "City", gu: "શહેર" },
    title: {
      en: "Saurashtra APMC Yards Report Brisk Post-Monsoon Groundnut and Cotton Arrivals",
      gu: "સૌરાષ્ટ્રના માર્કેટિંગ યાર્ડોમાં મગફળી અને કપાસની મબલખ આવક નોંધાઈ",
    },
    summary: {
      en: "[DEMO DATA] Agricultural yards in Rajkot, Gondal, and Junagadh expand electronic weighing slots for farmers.",
      gu: "[ડેમો ડેટા] રાજકોટ, ગોંડલ અને જૂનાગઢ યાર્ડમાં ખેડૂતો માટે ડિજિટલ તોલમાપ વ્યવસ્થા વિસ્તારવામાં આવી.",
    },
    teaserParagraphs: {
      en: [
        "RAJKOT (Demonstration Report): Post-harvest arrivals crossed seasonal averages across major APMC markets in Saurashtra this week.",
      ],
      gu: [
        "રાજકોટ (નિદર્શન અહેવાલ): સૌરાષ્ટ્રના મુખ્ય માર્કેટિંગ યાર્ડોમાં નવી સીઝનની આવકમાં નોંધપાત્ર વધારો જોવા મળ્યો છે.",
      ],
    },
    author: { en: "Saurashtra Bureau", gu: "સૌરાષ્ટ્ર બ્યુરો" },
    location: { en: "Rajkot", gu: "રાજકોટ" },
    publishedAt: "2026-11-03T09:20:00+05:30",
    readTimeMinutes: 2,
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Agricultural harvest in Gujarat.",
      gu: "નિદર્શન તસવીર: કૃષિ બજાર અને પાક.",
    },
    isHeadlineBrief: true,
    epaperPageNumber: 5,
    epaperEdition: { en: "Gujarat & Saurashtra Page", gu: "ગુજરાત-સૌરાષ્ટ્ર પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-brief-02",
    slug: "national-renewable-grid-storage-tender-announced",
    category: "national",
    categoryLabel: { en: "National", gu: "રાષ્ટ્રીય" },
    title: {
      en: "Power Ministry Approves 12 GW Grid-Scale Battery Storage Framework for Western Grid",
      gu: "પશ્ચિમી ગ્રીડ માટે ૧૨ ગીગાવોટ બેટરી સ્ટોરેજ માળખાને કેન્દ્રીય ઊર્જા મંત્રાલયની મંજૂરી",
    },
    summary: {
      en: "[DEMO DATA] Initiative designed to stabilize solar and wind power integration from Kutch and Rajasthan.",
      gu: "[ડેમો ડેટા] કચ્છ અને રાજસ્થાનના સૌર તથા પવન ઊર્જા ઉત્પાદનને સ્થિર ગ્રીડ સાથે જોડવા મહત્વનો નિર્ણય.",
    },
    teaserParagraphs: {
      en: [
        "NEW DELHI (Demonstration Report): The Union Ministry of Power finalized viability gap guidelines for round-the-clock renewable power distribution.",
      ],
      gu: [
        "નવી દિલ્હી (નિદર્શન અહેવાલ): કેન્દ્રીય ઊર્જા મંત્રાલયે ચોવીસ કલાક રિન્યુએબલ ઊર્જા પુરવઠા માટે નવી માર્ગદર્શિકા જાહેર કરી છે.",
      ],
    },
    author: { en: "New Delhi Bureau", gu: "નવી દિલ્હી બ્યુરો" },
    location: { en: "New Delhi", gu: "નવી દિલ્હી" },
    publishedAt: "2026-11-03T09:45:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Solar energy park.",
      gu: "નિદર્શન તસવીર: સૌર ઊર્જા પાર્ક.",
    },
    isHeadlineBrief: true,
    epaperPageNumber: 6,
    epaperEdition: { en: "National Page", gu: "રાષ્ટ્રીય પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-brief-03",
    slug: "ranji-trophy-mumbai-saurashtra-clash-preview",
    category: "sports",
    categoryLabel: { en: "Sports", gu: "રમતગમત" },
    title: {
      en: "Ranji Trophy: Mumbai and Saurashtra Prepare for High-Stakes Elite Group Encounter at Wankhede",
      gu: "રણજી ટ્રોફી: વાનખેડે સ્ટેડિયમ ખાતે મુંબઈ અને સૌરાષ્ટ્ર વચ્ચે રમાશે હાઈ-વોલ્ટેજ મુકાબલો",
    },
    summary: {
      en: "[DEMO DATA] Both domestic giants announce spin-heavy squads ahead of the four-day red-ball fixture.",
      gu: "[ડેમો ડેટા] ચાર દિવસીય મેચ પૂર્વે બંને ટીમોએ અનુભવી સ્પિનરો સાથે મેદાનમાં ઉતરવાની તૈયારી કરી.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): Domestic cricket's premier rivalry returns to Wankhede Stadium this week as defending contenders Mumbai host Saurashtra.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): ઘરેલુ ક્રિકેટની બે મજબૂત ટીમો મુંબઈ અને સૌરાષ્ટ્ર વચ્ચે વાનખેડે ખાતે રોમાંચક મુકાબલો યોજાશે.",
      ],
    },
    author: { en: "Sports Desk", gu: "સ્પોર્ટ્સ ડેસ્ક" },
    location: { en: "Mumbai", gu: "મુંબઈ" },
    publishedAt: "2026-11-03T10:05:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Cricket stadium pitch preparation.",
      gu: "નિદર્શન તસવીર: ક્રિકેટ સ્ટેડિયમ.",
    },
    isBreaking: true,
    isHeadlineBrief: true,
    epaperPageNumber: 14,
    epaperEdition: { en: "Sports Page", gu: "રમતગમત પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-brief-04",
    slug: "gujarati-natak-centenary-archival-exhibition-mumbai",
    category: "entertainment",
    categoryLabel: { en: "Entertainment", gu: "મનોરંજન" },
    title: {
      en: "Archival Exhibition on 100 Years of Gujarati Rangbhoomi Opens at NCPA and Bhavan's Chowpatty",
      gu: "ગુજરાતી રંગભૂમિના ૧૦૦ વર્ષની ગૌરવગાથા દર્શાવતું દુર્લભ પ્રદર્શન એનસીપીએ અને ભવન્સ ખાતે ખુલ્લું મુકાયું",
    },
    summary: {
      en: "[DEMO DATA] Rare playbills, handwritten scripts, and stage photographs curated for theatre enthusiasts.",
      gu: "[ડેમો ડેટા] દુર્લભ હસ્તપ્રતો, જૂના નાટકોના પોસ્ટરો અને ઐતિહાસિક તસવીરોનું અનોખું સંકલન.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): Theatre historians and veteran stage artistes gathered at Chowpatty to inaugurate a month-long retrospective of Gujarati drama.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): ચોપાટી ખાતે ગુજરાતી નાટ્યકલાના શતાબ્દી વારસાને ઉજાગર કરતા વિશેષ પ્રદર્શનનું ઉદ્ઘાટન કરવામાં આવ્યું.",
      ],
    },
    author: { en: "Cultural Correspondent", gu: "સાંસ્કૃતિક પ્રતિનિધિ" },
    location: { en: "Mumbai", gu: "મુંબઈ" },
    publishedAt: "2026-11-03T10:30:00+05:30",
    readTimeMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Classic theatre stage.",
      gu: "નિદર્શન તસવીર: ગુજરાતી રંગભૂમિ મંચ.",
    },
    isHeadlineBrief: true,
    epaperPageNumber: 12,
    epaperEdition: { en: "Kala & Sanskriti Supplement", gu: "કલા અને સંસ્કૃતિ પૂર્તિ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-nat-02",
    slug: "digital-public-library-manuscript-preservation-mission",
    category: "national",
    categoryLabel: { en: "National", gu: "રાષ્ટ્રીય" },
    title: {
      en: "National Archival Mission to Digitise Two Million Historical Periodicals and Regional Manuscripts",
      gu: "રાષ્ટ્રીય આર્કાઇવલ મિશન હેઠળ ૨૦ લાખ ઐતિહાસિક સામયિકો અને હસ્તપ્રતોનું ડિજિટાઇઝેશન કરાશે",
    },
    summary: {
      en: "[DEMO DATA] Universities and heritage trusts in Western India invited to participate in phase-two cataloguing.",
      gu: "[ડેમો ડેટા] પશ્ચિમ ભારતની યુનિવર્સિટીઓ અને હેરિટેજ ટ્રસ્ટોને બીજા તબક્કામાં જોડાવા આમંત્રણ.",
    },
    teaserParagraphs: {
      en: [
        "NEW DELHI (Demonstration Report): The Ministry of Culture announced new grants for preserving early 20th-century freedom movement newspapers and regional archives.",
      ],
      gu: [
        "નવી દિલ્હી (નિદર્શન અહેવાલ): સ્વાતંત્ર્ય સંગ્રામ સમયના અખબારો અને ઐતિહાસિક દસ્તાવેજોની જાળવણી માટે વિશેષ અનુદાન જાહેર કરવામાં આવ્યું છે.",
      ],
    },
    author: { en: "National Bureau", gu: "રાષ્ટ્રીય બ્યુરો" },
    location: { en: "New Delhi", gu: "નવી દિલ્હી" },
    publishedAt: "2026-11-03T06:40:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Archival library shelves.",
      gu: "નિદર્શન તસવીર: ઐતિહાસિક ગ્રંથાલય.",
    },
    epaperPageNumber: 7,
    epaperEdition: { en: "National Page", gu: "રાષ્ટ્રીય પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-city-03",
    slug: "ahmedabad-mumbai-high-speed-corridor-station-concourse-update",
    category: "city",
    categoryLabel: { en: "City", gu: "શહેર" },
    title: {
      en: "BKC and Surat Multimodal Terminal Concourses Achieve 80% Structural Completion",
      gu: "બીકેસી અને સુરત મલ્ટિમોડલ ટર્મિનલનું ૮૦ ટકા સ્ટ્રક્ચરલ બાંધકામ પૂર્ણ",
    },
    summary: {
      en: "[DEMO DATA] Integrated bus, metro, and suburban rail walkways designed for seamless intercity transit.",
      gu: "[ડેમો ડેટા] મેટ્રો, બસ અને રેલવે મુસાફરો માટે આધુનિક વોક-વે અને કનેક્ટિવિટી સુવિધા.",
    },
    teaserParagraphs: {
      en: [
        "SURAT / MUMBAI (Demonstration Report): Engineers inspecting the station concourses confirmed that solar roofing and passenger skywalks are on schedule.",
      ],
      gu: [
        "સુરત / મુંબઈ (નિદર્શન અહેવાલ): સ્ટેશન પરિસરમાં સોલાર રૂફિંગ અને પેસેન્જર સ્કાયવોકની કામગીરી નિર્ધારિત સમયપત્રક મુજબ આગળ વધી રહી છે.",
      ],
    },
    author: { en: "Infrastructure Desk", gu: "ઇન્ફ્રાસ્ટ્રક્ચર ડેસ્ક" },
    location: { en: "Mumbai / Surat", gu: "મુંબઈ / સુરત" },
    publishedAt: "2026-11-03T07:10:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Modern transit architecture.",
      gu: "નિદર્શન તસવીર: આધુનિક ટર્મિનલ નિર્માણ.",
    },
    epaperPageNumber: 4,
    epaperEdition: { en: "City Page", gu: "શહેર પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-biz-02",
    slug: "gift-city-fintech-regulatory-sandbox-cohort",
    category: "business",
    categoryLabel: { en: "Business", gu: "વ્યાપાર" },
    title: {
      en: "GIFT City IFSCA Approves New Cross-Border Maritime Insurance and Bullion Clearing Entities",
      gu: "ગિફ્ટ સિટી ખાતે મેરિટાઇમ ઇન્શ્યોરન્સ અને બુલિયન ક્લિયરિંગ માટે નવી સંસ્થાઓને મંજૂરી",
    },
    summary: {
      en: "[DEMO DATA] Domestic shipping lines and jewellery exporters gain direct hedging instruments within India.",
      gu: "[ડેમો ડેટા] ભારતીય શિપિંગ કંપનીઓ અને જ્વેલરી નિકાસકારોને દેશમાં જ આંતરરાષ્ટ્રીય નાણાકીય સુવિધા મળશે.",
    },
    teaserParagraphs: {
      en: [
        "GANDHINAGAR (Demonstration Report): The International Financial Services Centres Authority expanded its maritime and bullion ecosystem with six new institutional registrations.",
      ],
      gu: [
        "ગાંધીનગર (નિદર્શન અહેવાલ): ગિફ્ટ સિટીમાં મેરિટાઇમ અને બુલિયન ટ્રેડિંગ ક્ષેત્રે છ નવી સંસ્થાઓની નોંધણીને મંજૂરી આપવામાં આવી છે.",
      ],
    },
    author: { en: "Business Correspondent", gu: "વ્યાપાર પ્રતિનિધિ" },
    location: { en: "Gandhinagar", gu: "ગાંધીનગર" },
    publishedAt: "2026-11-03T08:40:00+05:30",
    readTimeMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Corporate financial analysis.",
      gu: "નિદર્શન તસવીર: નાણાકીય અને વ્યાપાર વિશ્લેષણ.",
    },
    epaperPageNumber: 11,
    epaperEdition: { en: "Vyapar Section", gu: "વ્યાપાર વિભાગ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-spt-02",
    slug: "inter-school-harris-shield-cricket-schedule-announced",
    category: "sports",
    categoryLabel: { en: "Sports", gu: "રમતગમત" },
    title: {
      en: "Mumbai Schools Sports Association Releases Fixtures for Annual Inter-School Cricket & Athletics",
      gu: "મુંબઈ સ્કૂલ્સ સ્પોર્ટ્સ એસોસિએશન દ્વારા વાર્ષિક આંતર-શાળા ક્રિકેટ અને એથ્લેટિક્સ સમયપત્રક જાહેર",
    },
    summary: {
      en: "[DEMO DATA] Over 280 schools across Mumbai and suburbs to compete at Azad Maidan and Cross Maidan.",
      gu: "[ડેમો ડેટા] આઝાદ મેદાન અને ક્રોસ મેદાન ખાતે મુંબઈની ૨૮૦થી વધુ શાળાઓના ખેલાડીઓ ભાગ લેશે.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): Grassroots school cricket kicks off this fortnight with strict pitch quality and hydration protocols across South Mumbai maidans.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): દક્ષિણ મુંબઈના મેદાનો પર આગામી પખવાડિયાથી શાળાકીય ક્રિકેટ સ્પર્ધાઓનો પ્રારંભ થશે.",
      ],
    },
    author: { en: "Sports Reporter", gu: "રમતગમત પ્રતિનિધિ" },
    location: { en: "Azad Maidan, Mumbai", gu: "આઝાદ મેદાન, મુંબઈ" },
    publishedAt: "2026-11-03T09:10:00+05:30",
    readTimeMinutes: 2,
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Grassroots cricket match.",
      gu: "નિદર્શન તસવીર: શાળાકીય ક્રિકેટ સ્પર્ધા.",
    },
    epaperPageNumber: 15,
    epaperEdition: { en: "Sports Page", gu: "રમતગમત પાનું" },
    isDemonstrationData: true,
  },
  {
    id: "jb-ent-02",
    slug: "classical-sugam-sangeet-festival-announcement",
    category: "entertainment",
    categoryLabel: { en: "Entertainment", gu: "મનોરંજન" },
    title: {
      en: "Three-Day Gujarati Sugam Sangeet & Kavya Sammelan to Celebrate Lyricists of the Golden Era",
      gu: "સુવર્ણ યુગના કવિઓ અને ગીતકારોને બિરદાવતો ત્રિદિવસીય ગુજરાતી સુગમ સંગીત અને કાવ્ય સમારોહ",
    },
    summary: {
      en: "[DEMO DATA] Young vocalists and veteran composers to perform classic compositions in Mumbai and Vadodara.",
      gu: "[ડેમો ડેટા] મુંબઈ અને વડોદરામાં જાણીતા સ્વરકારો અને યુવા ગાયકો અમર ગુજરાતી ગીતો રજૂ કરશે.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Report): Celebrating the poetic heritage of Gujarati literature, organisers announced a curated concert series featuring classical and folk ensembles.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન અહેવાલ): ગુજરાતી કાવ્ય અને સુગમ સંગીતની પરંપરાને ઉજાગર કરતા વિશેષ કાર્યક્રમની જાહેરાત કરવામાં આવી છે.",
      ],
    },
    author: { en: "Arts Desk", gu: "કલા વિભાગ" },
    location: { en: "Mumbai", gu: "મુંબઈ" },
    publishedAt: "2026-11-03T09:50:00+05:30",
    readTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Classical music performance.",
      gu: "નિદર્શન તસવીર: શાસ્ત્રીય અને સુગમ સંગીત કાર્યક્રમ.",
    },
    epaperPageNumber: 13,
    epaperEdition: { en: "Culture Supplement", gu: "સાંસ્કૃતિક પૂર્તિ" },
    isDemonstrationData: true,
  },
  {
    id: "jb-maran-01",
    slug: "community-obituary-and-besanu-notices-sample",
    category: "maran",
    categoryLabel: { en: "Maran (Obituaries)", gu: "મરણ નોંધ" },
    title: {
      en: "Daily Obituary & Besanu Announcements — Verified Print Edition Directory (Sample Notice)",
      gu: "દૈનિક અવસાન નોંધ અને બેસણું જાહેરાત — પ્રિન્ટ આવૃત્તિ ડિરેક્ટરી (નમૂનાની નોંધ)",
    },
    summary: {
      en: "[DEMO DATA] Official obituary notices and prayer meeting timings are verified by the Janmabhoomi desk and published in full inside the daily E-Paper.",
      gu: "[ડેમો ડેટા] જન્મભૂમિ કાર્યાલય દ્વારા પ્રમાણિત અવસાન નોંધ અને પ્રાર્થનાસભાની વિગતો દૈનિક ઈ-પેપરમાં પ્રકાશિત થાય છે.",
    },
    teaserParagraphs: {
      en: [
        "MUMBAI (Demonstration Notice): Complete daily Maran (Obituary) listings, community tributes, and Besanu venue schedules are available on Page 2 of today's Janmabhoomi E-Paper.",
      ],
      gu: [
        "મુંબઈ (નિદર્શન નોંધ): આજની સંપૂર્ણ મરણ નોંધ અને બેસણાની વિગતો જન્મભૂમિ ઈ-પેપરના પાના નં. ૨ પર ઉપલબ્ધ છે.",
      ],
    },
    author: { en: "Janmabhoomi Notice Desk", gu: "જન્મભૂમિ નોંધ વિભાગ" },
    location: { en: "Mumbai / Gujarat", gu: "મુંબઈ / ગુજરાત" },
    publishedAt: "2026-11-03T06:00:00+05:30",
    readTimeMinutes: 2,
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    imageCaption: {
      en: "Demonstration Image: Newspaper archival notice ledger.",
      gu: "નિદર્શન તસવીર: અખબાર નોંધ વિભાગ.",
    },
    epaperPageNumber: 2,
    epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
    isDemonstrationData: true,
  },
];

export const MOCK_EDITORIALS: EditorialArticle[] = [
  {
    id: "ed-today-01",
    slug: "urban-resilience-and-civic-accountability-in-coastal-cities",
    tag: "અગ્રલેખ",
    title: {
      en: "Urban Infrastructure Must Balance Speed with Long-Term Ecological Resilience",
      gu: "શહેરી માળખાકીય વિકાસમાં ગતિની સાથે લાંબા ગાળાની પર્યાવરણીય સુરક્ષા અનિવાર્ય",
    },
    excerpt: {
      en: "[DEMO EDITORIAL] As western coastal cities expand transport and port corridors, transparent civic audits and drainage preservation remain the true test of sustainable governance.",
      gu: "[ડેમો અગ્રલેખ] પશ્ચિમ કાંઠાના શહેરોમાં જ્યારે મેટ્રો અને કોસ્ટલ કોરિડોરનો ઝડપી વિકાસ થઈ રહ્યો છે, ત્યારે કુદરતી જળમાર્ગોની જાળવણી અને નાગરિક જવાબદારી ટકાઉ વિકાસની સાચી કસોટી છે.",
    },
    teaserParagraphs: {
      en: [
        "Demonstration Editorial Preview: Large-scale urban transport and maritime projects across Mumbai and Gujarat represent welcome investments in economic productivity. However, history teaches us that concrete expansion without ecological foresight creates recurring civic vulnerabilities during the monsoon.",
        "Read the full institutional અગ્રલેખ (Editorial) on Page 8 of today's Janmabhoomi E-Paper.",
      ],
      gu: [
        "નિદર્શન અગ્રલેખ પૂર્વાવલોકન: મુંબઈ અને ગુજરાતના શહેરોમાં ચાલી રહેલા વિશાળ પરિવહન પ્રકલ્પો આર્થિક પ્રગતિ માટે આવકારદાયક છે. પરંતુ પર્યાવરણીય સંતુલન અને નાગરિક સુવિધાઓના ઓડિટ વિનાનો વિકાસ લાંબા ગાળે પડકારો સર્જી શકે છે.",
        "આજનો સંપૂર્ણ અગ્રલેખ જન્મભૂમિ ઈ-પેપરના સંપાદકીય પાના નં. ૮ પર વાંચો.",
      ],
    },
    author: { en: "Janmabhoomi Editorial Board", gu: "જન્મભૂમિ સંપાદકીય મંડળ" },
    authorRole: { en: "Institutional Editorial • અગ્રલેખ", gu: "સંપાદકીય • અગ્રલેખ" },
    publishedDate: "2026-11-03",
    isTodaysEditorial: true,
    epaperPageNumber: 8,
    isDemonstrationData: true,
  },
  {
    id: "ed-prev-01",
    slug: "preserving-mother-tongue-in-digital-education-era",
    tag: "અગ્રલેખ",
    title: {
      en: "Mother-Tongue Literacy and Digital Innovation Are Complementary, Not Contradictory",
      gu: "ડિજિટલ યુગમાં માતૃભાષાનું જતન અને આધુનિક શિક્ષણ એકબીજાના પૂરક",
    },
    excerpt: {
      en: "[DEMO EDITORIAL] Empowering young readers with bilingual technical resources strengthens cultural roots alongside global competence.",
      gu: "[ડેમો અગ્રલેખ] નવી પેઢીને માતૃભાષામાં જ્ઞાન અને ટેકનોલોજી ઉપલબ્ધ કરાવવી એ સમયની માંગ છે.",
    },
    teaserParagraphs: {
      en: [
        "Demonstration Editorial Preview: Language is not merely a medium of instruction; it is the vessel of collective memory and critical thought.",
      ],
      gu: [
        "નિદર્શન અગ્રલેખ પૂર્વાવલોકન: ભાષા માત્ર સંવાદનું માધ્યમ નથી, પરંતુ સંસ્કૃતિ અને વિચારધારાની સંવાહક છે.",
      ],
    },
    author: { en: "Janmabhoomi Editorial Board", gu: "જન્મભૂમિ સંપાદકીય મંડળ" },
    authorRole: { en: "Editorial Archive • અગ્રલેખ", gu: "અગ્રલેખ આર્કાઇવ" },
    publishedDate: "2026-11-02",
    epaperPageNumber: 8,
    isDemonstrationData: true,
  },
  {
    id: "ed-prev-02",
    slug: "cooperative-banking-trust-and-modern-compliance",
    tag: "અગ્રલેખ",
    title: {
      en: "Strengthening Urban Cooperative Banks Through Governance & Digital Transparency",
      gu: "સહકારી બેંકિંગ ક્ષેત્રમાં પારદર્શક વહીવટ અને આધુનિક સુરક્ષા વ્યવસ્થાનું મહત્વ",
    },
    excerpt: {
      en: "[DEMO EDITORIAL] Small traders and household savers rely on cooperative institutions; robust board oversight is essential.",
      gu: "[ડેમો અગ્રલેખ] નાના વેપારીઓ અને મધ્યમ વર્ગની બચતનો આધાર સહકારી સંસ્થાઓના સુદ્રઢ વહીવટ પર રહેલો છે.",
    },
    teaserParagraphs: {
      en: [
        "Demonstration Editorial Preview: Cooperative credit has historically fuelled enterprise across Western India.",
      ],
      gu: [
        "નિદર્શન અગ્રલેખ પૂર્વાવલોકન: પશ્ચિમ ભારતના વેપાર અને ઉદ્યોગના વિકાસમાં સહકારી બેંકોનો ફાળો અમૂલ્ય રહ્યો છે.",
      ],
    },
    author: { en: "Senior Economic Columnist", gu: "વરિષ્ઠ આર્થિક વિશ્લેષક" },
    authorRole: { en: "Opinion Column • વિચાર", gu: "વિશેષ કોલમ • વિચાર" },
    publishedDate: "2026-11-01",
    epaperPageNumber: 8,
    isDemonstrationData: true,
  },
];

export const MOCK_SPECIAL_EVENTS: SpecialEventItem[] = [
  {
    id: "sp-cov-01",
    slug: "janmabhoomi-92-years-freedom-press-heritage-series",
    type: "special-coverage",
    badge: { en: "SPECIAL COVERAGE BANNER", gu: "વિશેષ કવરેજ શ્રેણી" },
    title: {
      en: "Legacy of Nationalist Journalism: Archival Dossier on Janmabhoomi's Historic Print Editions",
      gu: "રાષ્ટ્રવાદી પત્રકારત્વનો વારસો: જન્મભૂમિના ઐતિહાસિક અંકોની વિશેષ દસ્તાવેજી શ્રેણી",
    },
    description: {
      en: "[DEMO DATA] Explore curated stories on how Saurashtra Trust publications chronicled India's independence movement, industrial rise, and literary renaissance.",
      gu: "[ડેમો ડેટા] ભારતના સ્વાતંત્ર્ય સંગ્રામથી લઈને આધુનિક ઔદ્યોગિક અને સાહિત્યિક વિકાસની જન્મભૂમિની સફર.",
    },
    dateLabel: { en: "Ongoing Archival Series • 2026", gu: "ચાલુ વિશેષ શ્રેણી • ૨૦૨૬" },
    location: { en: "Mumbai & Saurashtra Archives", gu: "મુંબઈ અને સૌરાષ્ટ્ર આર્કાઇવ્સ" },
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
    ctaLabel: { en: "Explore Special Dossier", gu: "વિશેષ શ્રેણી જુઓ" },
    isDemonstrationData: true,
  },
  {
    id: "ev-card-01",
    slug: "mumbai-gujarati-sahitya-and-journalism-conclave",
    type: "event",
    badge: { en: "FEATURED EVENT", gu: "આગામી કાર્યક્રમ" },
    title: {
      en: "Janmabhoomi Annual Literary & Media Conclave — Mumbai Edition",
      gu: "જન્મભૂમિ વાર્ષિક સાહિત્ય અને પત્રકારત્વ સંવાદ — મુંબઈ",
    },
    description: {
      en: "[DEMO EVENT] Panel discussions with editors, authors, and civic leaders on regional journalism in the digital age.",
      gu: "[ડેમો કાર્યક્રમ] ડિજિટલ યુગમાં પ્રાદેશિક પત્રકારત્વ અને સાહિત્ય વિષય પર સંપાદકો અને સાહિત્યકારોનો સંવાદ.",
    },
    dateLabel: { en: "Saturday, 21 November 2026 (Sample Date)", gu: "શનિવાર, ૨૧ નવેમ્બર ૨૦૨૬ (નમૂનાની તારીખ)" },
    location: { en: "Birla Matushri Sabhagar, Marine Lines, Mumbai", gu: "બિરલા માતુશ્રી સભાગાર, મરીન લાઇન્સ, મુંબઈ" },
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    ctaLabel: { en: "View Event Details", gu: "કાર્યક્રમની વિગતો" },
    isDemonstrationData: true,
  },
  {
    id: "ev-card-02",
    slug: "msme-export-growth-symposium-surat-rajkot",
    type: "event",
    badge: { en: "ECONOMIC FORUM", gu: "વ્યાપાર પરિષદ" },
    title: {
      en: "Vyapar & Janmabhoomi SME Industrial Growth Forum",
      gu: "વ્યાપાર અને જન્મભૂમિ એમએસએમઈ ઔદ્યોગિક વિકાસ પરિષદ",
    },
    description: {
      en: "[DEMO EVENT] Interactive sessions on export financing, port logistics, and family business governance.",
      gu: "[ડેમો કાર્યક્રમ] નિકાસ ધિરાણ, લોજિસ્ટિક્સ અને ઉદ્યોગ સંચાલન અંગે નિષ્ણાતોનું માર્ગદર્શન.",
    },
    dateLabel: { en: "December 2026 (Sample Schedule)", gu: "ડિસેમ્બર ૨૦૨૬ (નમૂનાનું સમયપત્રક)" },
    location: { en: "Mumbai / Rajkot / Surat", gu: "મુંબઈ / રાજકોટ / સુરત" },
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    ctaLabel: { en: "Register Interest", gu: "વિગતો જુઓ" },
    isDemonstrationData: true,
  },
];

export const MOCK_PANCHANG: PanchangData = {
  noticeLabel: {
    en: "SAMPLE DEMONSTRATION DATA — Placeholder for Daily Panchang API Feed (Do not use for actual religious timings)",
    gu: "નમૂનાનો ડેમો ડેટા — દૈનિક પંચાંગ ફીડ પ્લેસહોલ્ડર (વાસ્તવિક ધાર્મિક મુહૂર્ત માટે ઉપયોગ કરવો નહીં)",
  },
  displayDate: {
    en: "Sample Entry • Tuesday, 3 November 2026",
    gu: "નમૂનાની નોંધ • મંગળવાર, ૩ નવેમ્બર ૨૦૨૬",
  },
  vikramSamvat: {
    en: "Vikram Samvat 2082 (Sample Placeholder)",
    gu: "વિક્રમ સંવત ૨૦૮૨ (નમૂનાની વિગત)",
  },
  tithi: {
    en: "Sample Tithi Placeholder (Paksha / Tithi)",
    gu: "નમૂનાની તિથિ (પક્ષ / તિથિ પ્લેસહોલ્ડર)",
  },
  nakshatra: {
    en: "Sample Nakshatra Placeholder",
    gu: "નમૂનાનું નક્ષત્ર પ્લેસહોલ્ડર",
  },
  yoga: {
    en: "Sample Yoga Placeholder",
    gu: "નમૂનાનો યોગ પ્લેસહોલ્ડર",
  },
  karana: {
    en: "Sample Karana Placeholder",
    gu: "નમૂનાનું કરણ પ્લેસહોલ્ડર",
  },
  sunrise: "06:41 AM (Sample)",
  sunset: "06:04 PM (Sample)",
  rahuKaal: "03:00 PM – 04:30 PM (Sample)",
  auspiciousNote: {
    en: "Verified daily Janmabhoomi Panchang compiled by authorised Jyotish scholars will be automatically populated from the central CMS.",
    gu: "જન્મભૂમિના અધિકૃત પંચાંગ નિષ્ણાતો દ્વારા તૈયાર કરાયેલ દૈનિક વિગતો સેન્ટ્રલ સીએમએસ (CMS) સાથે જોડાણ બાદ આપોઆપ પ્રદર્શિત થશે.",
  },
  isDemonstrationSample: true,
};

export const MOCK_SISTER_PUBLICATIONS: SisterPublication[] = [
  {
    id: "pub-phulchhab",
    name: { en: "Phulchhab", gu: "ફૂલછાબ" },
    tagline: {
      en: "Premier Daily of Saurashtra from Rajkot",
      gu: "સૌરાષ્ટ્રનું લોકપ્રિય દૈનિક (રાજકોટ)",
    },
    language: { en: "Gujarati Daily", gu: "ગુજરાતી દૈનિક" },
    frequency: { en: "Daily Morning", gu: "દૈનિક સવાર" },
    establishedYear: "1921",
    region: { en: "Rajkot & Saurashtra", gu: "રાજકોટ અને સૌરાષ્ટ્ર" },
    websiteUrl: "/epaper?publication=phulchhab",
    epaperUrl: "/epaper?publication=phulchhab",
    logoPlaceholderCode: "ફૂલછાબ",
    isPlaceholderAsset: true,
  },
  {
    id: "pub-kutchmitra",
    name: { en: "Kutchmitra", gu: "કચ્છમિત્ર" },
    tagline: {
      en: "The Voice of Kutch from Bhuj",
      gu: "કચ્છનું પોતીકું દૈનિક (ભુજ)",
    },
    language: { en: "Gujarati Daily", gu: "ગુજરાતી દૈનિક" },
    frequency: { en: "Daily Morning", gu: "દૈનિક સવાર" },
    establishedYear: "1947",
    region: { en: "Bhuj & Kutch District", gu: "ભુજ અને સમગ્ર કચ્છ" },
    websiteUrl: "/epaper?publication=kutchmitra",
    epaperUrl: "/epaper?publication=kutchmitra",
    logoPlaceholderCode: "કચ્છમિત્ર",
    isPlaceholderAsset: true,
  },
  {
    id: "pub-vyapar",
    name: { en: "Vyapar", gu: "વ્યાપાર" },
    tagline: {
      en: "India's Pioneer Gujarati Financial & Commercial Periodical",
      gu: "ભારતનું પ્રથમ ગુજરાતી વાણિજ્ય અને આર્થિક અખબાર",
    },
    language: { en: "Gujarati Financial", gu: "ગુજરાતી વ્યાપાર અખબાર" },
    frequency: { en: "Bi-Weekly / Commercial", gu: "વાણિજ્ય આવૃત્તિ" },
    establishedYear: "1949",
    region: { en: "Mumbai & All India", gu: "મુંબઈ અને સમગ્ર ભારત" },
    websiteUrl: "/epaper?publication=vyapar",
    epaperUrl: "/epaper?publication=vyapar",
    logoPlaceholderCode: "વ્યાપાર",
    isPlaceholderAsset: true,
  },
  {
    id: "pub-pravasi",
    name: { en: "Janmabhoomi Pravasi", gu: "જન્મભૂમિ પ્રવાસી" },
    tagline: {
      en: "Sunday & Weekly Family Edition from Mumbai",
      gu: "મુંબઈનું લોકપ્રિય સાપ્તાહિક અને રવિવાર આવૃત્તિ",
    },
    language: { en: "Gujarati Edition", gu: "ગુજરાતી આવૃત્તિ" },
    frequency: { en: "Weekly / Sunday", gu: "રવિવાર વિશેષ" },
    establishedYear: "1939",
    region: { en: "Mumbai Metropolitan Region", gu: "મુંબઈ મહાનગર" },
    websiteUrl: "/epaper?publication=pravasi",
    epaperUrl: "/epaper?publication=pravasi",
    logoPlaceholderCode: "પ્રવાસી",
    isPlaceholderAsset: true,
  },
  {
    id: "pub-khabarchhe",
    name: { en: "Janmabhoomi Khगोल / Panchang", gu: "જન્મભૂમિ ખગોળ સિદ્ધ પંચાંગ" },
    tagline: {
      en: "Authentic Astronomical & Traditional Almanac",
      gu: "પ્રમાણભૂત ખગોળશાસ્ત્રીય વાર્ષિક પંચાંગ પ્રકાશન",
    },
    language: { en: "Gujarati & English", gu: "ગુજરાતી અને અંગ્રેજી" },
    frequency: { en: "Annual Almanac", gu: "વાર્ષિક પ્રકાશન" },
    establishedYear: "1934",
    region: { en: "Global Diaspora", gu: "દેશ-વિદેશ" },
    websiteUrl: "/panchang",
    epaperUrl: "/epaper?publication=panchang",
    logoPlaceholderCode: "પંચાંગ",
    isPlaceholderAsset: true,
  },
];

export const MOCK_AD_SLOTS: Record<string, AdvertisementSlot> = {
  homepagePrimaryHorizontal: {
    id: "ad-home-leaderboard-01",
    placementName: "Homepage Primary Horizontal Leaderboard (Section 3)",
    dimensionsLabel: "970 × 110 px Responsive Editorial Banner",
    sponsorHeadline: {
      en: "Janmabhoomi Digital & Print Combined Corporate Advertising Solutions",
      gu: "જન્મભૂમિ પ્રિન્ટ અને ડિજિટલ આવૃત્તિમાં કોર્પોરેટ જાહેરાત માટે સંપર્ક કરો",
    },
    sponsorSubtext: {
      en: "Reserved non-intrusive horizontal display slot • Reach decision-makers across Mumbai, Saurashtra, Kutch & Gujarat.",
      gu: "મુંબઈ, સૌરાષ્ટ્ર, કચ્છ અને ગુજરાતના લાખો વિશ્વસનીય વાચકો સુધી પહોંચવાનું શ્રેષ્ઠ માધ્યમ.",
    },
    ctaText: {
      en: "Advertise With Us",
      gu: "જાહેરાત વિભાગ સંપર્ક",
    },
    ctaHref: "/contact",
    isDemoSlot: true,
  },
};
