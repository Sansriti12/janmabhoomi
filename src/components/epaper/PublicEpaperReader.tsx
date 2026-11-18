"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Lock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sun,
  Moon,
  Coffee,
  ZoomIn,
  RotateCcw,
  Sparkles,
  Columns,
  Square,
  Play,
  Square as StopIcon,
  MapPin,
  Trash2,
} from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { speakText, stopSpeaking as haltSpeaking } from "@/lib/utils/speechHelper";

export interface PublicHotspot {
  id: string;
  xPercent: number | string;
  yPercent: number | string;
  widthPercent: number | string;
  heightPercent: number | string;
  headlineText?: string;
  summaryText?: string;
  articleParagraphs?: string[];
  targetType: "article" | "external" | "zoom";
  externalUrl?: string;
  articleId?: string;
  articleSlug?: string;
}

export interface SavedClipItem {
  id: string;
  headlineText: string;
  summaryText: string;
  articleSlug?: string;
  pageNumber: number;
  savedAt: string;
}

export interface PublicPageItem {
  id: string;
  pageNumber: number;
  labelEn: string;
  labelGu: string;
  widthPx: number;
  heightPx: number;
  isFreePreview: boolean;
  imageThumbnailKey: string;
  hotspots?: PublicHotspot[];
}

export interface PublicEditionDetail {
  id: string;
  publicationId: string;
  editionDate: string;
  editionCity: string;
  editionNameEn: string;
  editionNameGu: string;
  totalPageCount: number;
  freePreviewPageLimit?: number;
  status: string;
  pages: PublicPageItem[];
}

export interface EditionSummaryItem {
  id: string;
  publicationId: string;
  editionDate: string;
  editionCity: string;
  editionNameEn: string;
  editionNameGu: string;
  totalPageCount: number;
  status: string;
  coverImageUrl?: string;
}

const JANMABHOOMI_PUBLICATIONS = [
  {
    id: "pub-janmabhoomi",
    code: "JB",
    nameEn: "Janmabhoomi",
    nameGu: "જન્મભૂમિ",
    freqEn: "Daily Broadsheet",
    freqGu: "દૈનિક સાંધ્ય અખબાર",
    city: "Mumbai",
  },
  {
    id: "pub-pravasi",
    code: "JBP",
    nameEn: "Janmabhoomi Pravasi",
    nameGu: "જન્મભૂમિ પ્રવાસી",
    freqEn: "Sunday Weekly",
    freqGu: "સાપ્તાહિક રવિવારીય",
    city: "Mumbai",
  },
  {
    id: "pub-purti",
    code: "JPT",
    nameEn: "Janmabhoomi Purti",
    nameGu: "જન્મભૂમિ પૂર્તિ",
    freqEn: "Special Supplements",
    freqGu: "વિશેષ સાપ્તાહિક પૂર્તિઓ",
    city: "Mumbai",
  },
  {
    id: "pub-phulchhab",
    code: "PHL",
    nameEn: "Phulchhab",
    nameGu: "ફૂલછાબ",
    freqEn: "Daily Morning",
    freqGu: "દૈનિક પ્રભાત",
    city: "Rajkot",
  },
  {
    id: "pub-kutchmitra",
    code: "KTM",
    nameEn: "Kutchmitra",
    nameGu: "કચ્છમિત્ર",
    freqEn: "Daily Morning",
    freqGu: "દૈનિક પ્રભાત",
    city: "Bhuj",
  },
  {
    id: "pub-vyapar-gu",
    code: "VYG",
    nameEn: "Vyapar (Gujarati)",
    nameGu: "વ્યાપાર (ગુજરાતી)",
    freqEn: "Bi-Weekly Financial",
    freqGu: "દ્વિ-સાપ્તાહિક આર્થિક",
    city: "Mumbai",
  },
  {
    id: "pub-vyapar-hi",
    code: "VYH",
    nameEn: "Vyapar (Hindi)",
    nameGu: "વ્યાપાર (હિન્દી)",
    freqEn: "Weekly Financial",
    freqGu: "સાપ્તાહિક આર્થિક",
    city: "Mumbai",
  },
  {
    id: "pub-panchang",
    code: "PAN",
    nameEn: "Janmabhoomi Panchang",
    nameGu: "જન્મભૂમિ પંચાંગ",
    freqEn: "Annual Almanac",
    freqGu: "વાર્ષિક પંચાંગ",
    city: "Mumbai",
  },
  {
    id: "pub-kavita",
    code: "KAV",
    nameEn: "Kavita",
    nameGu: "કવિતા",
    freqEn: "Quarterly Magazine",
    freqGu: "ત્રિમાસિક સામાયિક",
    city: "Mumbai",
  },
];

function generateDefaultEditions(): EditionSummaryItem[] {
  const today = new Date().toISOString().split("T")[0];
  return JANMABHOOMI_PUBLICATIONS.map((pub) => ({
    id: `edition-${pub.id}-latest`,
    publicationId: pub.id,
    editionDate: today,
    editionCity: pub.city,
    editionNameEn: `${pub.nameEn} Digital Edition`,
    editionNameGu: `${pub.nameGu} ડિજિટલ આવૃત્તિ`,
    totalPageCount: pub.id === "pub-purti" ? 8 : pub.id === "pub-panchang" ? 4 : 12,
    status: "PUBLISHED",
    coverImageUrl: "/assets/images/epaper-placeholder.jpg",
  }));
}

// Seeded database article slugs matched to broadsheet pages
const DEFAULT_PAGE_HOTSPOTS: Record<number, PublicHotspot[]> = {
  1: [
    {
      id: "demo-h1",
      xPercent: 3,
      yPercent: 12,
      widthPercent: 46,
      heightPercent: 38,
      headlineText: "સેન્સેક્સ ૮૫,૦૦૦ ને પાર: ભારતીય શેરબજારમાં ઐતિહાસિક તેજીનો નવો દોર",
      summaryText:
        "મુંબઈ શેરબજારમાં વિદેશી સંસ્થાકીય રોકાણકારોની ભારે લેવાલી અને આર્થિક સુધારાઓના પરિણામે સેન્સેક્સ અને નિફ્ટી સર્વોચ્ચ શિખરે પહોંચ્યા. આઈટી, બેંકિંગ અને ઓટો શેરોમાં અભૂતપૂર્વ ઉછાળો નોંધાયો.",
      articleParagraphs: [
        "મુંબઈ શેરબજારમાં આજે વિદેશી સંસ્થાકીય રોકાણકારોની ભારે લેવાલી અને સકારાત્મક આર્થિક નીતિઓના પરિણામે સેન્સેક્સ પ્રથમવાર ૮૫,૦૦૦ ની ઐતિહાસિક સપાટી પાર કરી ગયો છે.",
        "નિફ્ટી પણ ૨૬,૦૦૦ ની સર્વોચ્ચ ટોચે પહોંચ્યો છે. આઈટી, બેંકિંગ અને ઓટોમોબાઈલ શેરોમાં અભૂતપૂર્વ ઉછાળો નોંધાયો હતો.",
        "બજાર નિષ્ણાતોના મતે ભારતીય જીડીપીના મજબૂત વૃદ્ધિદર અને કોર્પોરેટ કમાણીના સારા પરિણામો આગામી સમયમાં પણ આ તેજીને વેગ આપશે.",
      ],
      targetType: "article",
      articleSlug: "sensex-crosses-85000-historic-bull-run-en",
    },
    {
      id: "demo-h2",
      xPercent: 51,
      yPercent: 12,
      widthPercent: 46,
      heightPercent: 28,
      headlineText: "મુંબઈ કોસ્ટલ રોડ ફેઝ-૨ નું લોકાર્પણ: દક્ષિણ મુંબઈથી ઉપનગરો સુધી ટ્રાફિક મુક્ત મુસાફરી",
      summaryText:
        "મુંબઈ મહાનગરપાલિકા દ્વારા નિર્મિત કોસ્ટલ રોડના બીજા તબક્કાનું ઉદ્ઘાટન કરવામાં આવ્યું. નવા સી-લિંક કનેક્ટરથી દક્ષિણ મુંબઈથી અંધેરી સુધીનો પ્રવાસ માત્ર ૨૫ મિનિટમાં શક્ય બનશે.",
      articleParagraphs: [
        "મુંબઈ મહાનગરપાલિકા દ્વારા નિર્મિત કોસ્ટલ રોડના બીજા તબક્કાનું આજે સત્તાવાર લોકાર્પણ કરવામાં આવ્યું છે.",
        "નવા સી-લિંક કનેક્ટર કાર્યરત થવાથી દક્ષિણ મુંબઈના નરીમાન પોઇન્ટથી પશ્ચિમી ઉપનગરો સુધીની મુસાફરી માત્ર ૨૫ મિનિટમાં પૂર્ણ થશે.",
        "આ માર્ગ પર અદ્યતન ટનલ વેન્ટિલેશન સિસ્ટમ અને સીસીટીવી સર્વેલન્સ ગોઠવવામાં આવ્યા છે, જેથી ટ્રાફિક વ્યવસ્થા સુગમ રહેશે.",
      ],
      targetType: "article",
      articleSlug: "mumbai-coastal-road-phase-two-inauguration-en",
    },
    {
      id: "demo-h3",
      xPercent: 3,
      yPercent: 52,
      widthPercent: 46,
      heightPercent: 42,
      headlineText: "સંસદનું શિયાળુ સત્ર: આર્થિક સુધારા અને નાગરિક સુરક્ષા સાથે જોડાયેલા મહત્વપૂર્ણ ખરડાઓ રજૂ",
      summaryText:
        "નવી દિલ્હીમાં સંસદના બંને ગૃહોમાં ડિજિટલ અર્થતંત્ર, નિકાસ પ્રોત્સાહન અને ગ્રામીણ ઈન્ફ્રાસ્ટ્રક્ચર સંબંધિત વિધેયકો પર ગહન ચર્ચા.",
      articleParagraphs: [
        "નવી દિલ્હીમાં સંસદના બંને ગૃહોમાં ડિજિટલ અર્થતંત્ર, નિકાસ પ્રોત્સાહન અને ગ્રામીણ ઈન્ફ્રાસ્ટ્રક્ચર સંબંધિત મહત્વપૂર્ણ ખરડાઓ રજૂ કરવામાં આવ્યા છે.",
        "કેન્દ્રીય મંત્રીઓએ ગૃહમાં સ્પષ્ટતા કરી હતી કે આ સુધારાઓથી ભારતીય નાના ઉદ્યોગોને વૈશ્વિક વેપારમાં સરળ મૂડી અને ધિરાણ મળી રહેશે.",
      ],
      targetType: "article",
      articleSlug: "parliament-winter-session-economic-reforms-en",
    },
    {
      id: "demo-h4",
      xPercent: 51,
      yPercent: 42,
      widthPercent: 46,
      heightPercent: 52,
      headlineText: "અગ્રલેખ: લોકશાહી વ્યવસ્થા અને સંસ્થાગત સ્વાયત્તતાનું રક્ષણ",
      summaryText:
        "સંસ્થાકીય સ્વાયત્તતા એ કોઈપણ જીવંત લોકશાહીનો આધારસ્તંભ છે. પારદર્શિતા અને નાગરિક અધિકારોની જાળવણી એ જ શ્રેષ્ઠ શાસનની ઓળખ છે.",
      articleParagraphs: [
        "સંસ્થાકીય સ્વાયત્તતા એ કોઈપણ જીવંત અને સશક્ત લોકશાહીનો પાયાનો આધારસ્તંભ છે.",
        "ન્યાયતંત્ર અને લોકતાંત્રિક સંસ્થાઓની નિષ્પક્ષતા જ જનતામાં શાસન વ્યવસ્થા પ્રત્યે અતૂટ વિશ્વાસ જાળવી રાખે છે.",
        "પારદર્શક નીતિઓ અને નાગરિક અધિકારોનું રક્ષણ એ જ સ્વસ્થ સમાજ નિર્માણનો સાચો માર્ગ છે.",
      ],
      targetType: "article",
      articleSlug: "editorial-institutional-autonomy-democracy-en",
    },
  ],
  2: [
    {
      id: "demo-p2-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 40,
      headlineText: "મુંબઈમાં જાહેર પરિવહનને વધુ સુવિધાજનક બનાવવા નવી મેટ્રો સેવા શરૂ",
      summaryText:
        "મુંબઈ મહાનગરમાં મુસાફરોની વધતી ભીડને ધ્યાનમાં રાખીને નવી મેટ્રો લાઇનનું પરિચાલન શરૂ કરાયું છે. લાખો દૈનિક પ્રવાસીઓને રાહત મળશે.",
      articleParagraphs: [
        "મુંબઈ મહાનગરમાં મુસાફરોની વધતી ભીડને ધ્યાનમાં રાખીને નવી મેટ્રો લાઇનનું પરિચાલન આજથી શરૂ કરવામાં આવ્યું છે.",
        "આ લાઇન પશ્ચિમી ઉપનગરોને સીધા સેન્ટ્રલ બિઝનેસ ડિસ્ટ્રિક્ટ્સ સાથે જોડે છે, જેનાથી પીક-અવર્સ દરમિયાન પ્રવાસ સમયમાં ૪૫ મિનિટનો બચાવ થશે.",
        "તમામ સ્ટેશનો પર ઓટોમેટિક ફેર કલેક્શન ગેટ્સ, દિવ્યાંગો માટે અદ્યતન સુવિધાઓ અને ઝીરો-એમિશન ફીડર બસોનું સંકલન કરાયું છે.",
      ],
      targetType: "article",
      articleSlug: "mumbai-f9d4d4",
    },
  ],
  7: [
    {
      id: "demo-p7-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 46,
      heightPercent: 42,
      headlineText: "ગુજરાત અને મહારાષ્ટ્ર વચ્ચે ઔદ્યોગિક સહયોગ: નવા વેપારી પ્રોજેક્ટ્સની જાહેરાત",
      summaryText:
        "ઔદ્યોગિક ચેમ્બર ઓફ કોમર્સની સંયુક્ત બેઠકમાં બંને રાજ્યો વચ્ચે કાપડ, રસાયણ અને એન્જિનિયરિંગ સેક્ટરમાં સંયુક્ત રોકાણ યોજનાઓની જાહેરાત કરાઈ.",
      articleParagraphs: [
        "મહારાષ્ટ્ર અને ગુજરાત વચ્ચેના મહત્વપૂર્ણ માળખાકીય સંકલનના ભાગરૂપે બંને રાજ્યોના ઔદ્યોગિક ચેમ્બરની સંયુક્ત બેઠક યોજાઈ હતી.",
        "આ બેઠકમાં કાપડ, રસાયણ અને એન્જિનિયરિંગ સેક્ટરમાં સંયુક્ત રોકાણ યોજનાઓની જાહેરાત કરવામાં આવી છે.",
        "પરિવહન માર્ગોના આધુનિકીકરણથી બંને રાજ્યો વચ્ચે કાચા માલ અને તૈયાર ઉત્પાદનોની અવરજવર વધુ ઝડપી અને કરકસરભરી બનશે.",
      ],
      targetType: "article",
    },
    {
      id: "demo-p7-h2",
      xPercent: 51,
      yPercent: 10,
      widthPercent: 46,
      heightPercent: 42,
      headlineText: "નાગરિક સુવિધાઓ અને સ્માર્ટ સિટી મિશન હેઠળ નવા ઈન્ફ્રાસ્ટ્રક્ચર કામો મંજૂર",
      summaryText:
        "શહેરી વિકાસ સત્તામંડળ દ્વારા પાણી પુરવઠો, ગટર વ્યવસ્થા અને વરસાદી પાણીના નિકાલ માટે મહત્વપૂર્ણ પ્રોજેક્ટ્સને મંજૂરી અપાઈ.",
      articleParagraphs: [
        "શહેરી વિકાસ સત્તામંડળ દ્વારા પાણી પુરવઠો, ગટર વ્યવસ્થા અને વરસાદી પાણીના નિકાલ માટે મહત્વપૂર્ણ પ્રોજેક્ટ્સને મંજૂરી આપવામાં આવી છે.",
        "આ યોજનાઓથી નાગરિકોના રોજિંદા જીવનધોરણમાં સુધારો થશે અને ચોમાસા દરમિયાન જળબંબાકારની સ્થિતિ પર કાયમી નિયંત્રણ મેળવી શકાશે.",
      ],
      targetType: "article",
    },
  ],
  8: [
    {
      id: "demo-p8-h1",
      xPercent: 4,
      yPercent: 28,
      widthPercent: 44,
      heightPercent: 36,
      headlineText: "કચ્છના દાનવીર, સમાજસેવક ચંદ્રકાંતભાઈ ગોગરીનું નિધન",
      summaryText:
        "કચ્છના જાણીતા દાનવીર અને સેવાભાવી અગ્રણી ચંદ્રકાંતભાઈ ગોગરીનું નિધન થયું છે. કચ્છી સમાજ, શિક્ષણ અને આરોગ્ય ક્ષેત્રે તેમના સેવાકાર્યો ચિરસ્મરણીય રહેશે.",
      articleParagraphs: [
        "મુંબઈ: કચ્છના જાણીતા ઉદ્યોગપતિ, સેવાભાવી અગ્રણી અને આરતી ઇન્ડસ્ટ્રીઝના સ્થાપક ચંદ્રકાંતભાઈ ગોગરીનું ૭૯ વર્ષની વયે મુંબઈ ખાતે નિધન થયું છે.",
        "ચંદ્રકાંતભાઈએ કચ્છી વિસા ઓસવાળ સમાજ, શિક્ષણ, ગ્રામીણ જળસંચય અને કુદરતી આપત્તિ રાહત ક્ષેત્રે કરોડો રૂપિયાનું દાન આપીને હજારો પરિવારોનું જીવન પરિવર્તિત કર્યું હતું.",
        "મુખ્યમંત્રી અને સામાજિક અગ્રણીઓએ તેમના નિધન પર શોક વ્યક્ત કરતાં જણાવ્યું કે સમાજે એક સમર્પિત સેવામૂર્તિ અને પ્રેરણાદાયી રાષ્ટ્રસેવક ગુમાવ્યા છે.",
      ],
      targetType: "article",
    },
    {
      id: "demo-p8-h2",
      xPercent: 50,
      yPercent: 28,
      widthPercent: 46,
      heightPercent: 36,
      headlineText: "ભોસરી વિધાનસભા ક્ષેત્રમાંથી ૪૦ હજાર મતદારોના નામ અન્યત્ર ખસેડવા અંગે પોલીસ ફરિયાદ",
      summaryText:
        "ચૂંટણી પંચ સમક્ષ મતદાર યાદીમાં ગેરરીતિની રજૂઆત સાથે પોલીસ ફરિયાદ દાખલ કરવામાં આવી. અધિકારીઓએ તપાસ શરૂ કરી છે.",
      articleParagraphs: [
        "પુણે: ભોસરી વિધાનસભા ક્ષેત્રમાંથી આશરે ૪૦,૦૦૦ જેટલા કાયદેસર મતદારોના નામ મનસ્વી રીતે અન્ય કેન્દ્રો પર ખસેડી દેવામાં આવ્યા હોવાના આક્ષેપ સાથે પોલીસ મથકે સત્તાવાર ફરિયાદ દાખલ કરવામાં આવી છે.",
        "વિપક્ષી આગેવાનોએ ચૂંટણી અધિકારીઓ સમક્ષ પુરાવા રજૂ કરતાં આક્ષેપ કર્યો છે કે રહેણાંક સરનામાની પૂરતી ચકાસણી કર્યા વિના જ મતદારોના નામોની યાદીમાં ફેરફાર કરાયા છે.",
        "પોલીસે ફરિયાદની નોંધ લઈ સાયબર સેલ અને મહેસૂલી તંત્રની મદદથી ડિજિટલ રેકોર્ડ્સની તપાસ હાથ ધરી છે.",
      ],
      targetType: "article",
    },
    {
      id: "demo-p8-h3",
      xPercent: 4,
      yPercent: 66,
      widthPercent: 92,
      heightPercent: 30,
      headlineText: "શ્રદ્ધાંજલિ અને શોક સંદેશ: જાણીતા મહાનુભાવોને ભાવભીની અંજલિ",
      summaryText:
        "સામાજિક અને વ્યાપારી જગતના અગ્રણીઓ દ્વારા શોક સંદેશાઓ પાઠવવામાં આવ્યા. પરિવારો પ્રત્યે સાંત્વના વ્યક્ત કરવામાં આવી.",
      articleParagraphs: [
        "આજના અંકમાં મુંબઈ અને ગુજરાતના સામાજિક તેમજ વ્યાપારી ક્ષેત્રના અગ્રણીઓને શ્રદ્ધાંજલિ પાઠવવામાં આવી છે.",
        "પરિવારો પ્રત્યે સાંત્વના વ્યક્ત કરીને દિવંગત આત્માઓની શાંતિ માટે પ્રાર્થના સભાઓનું આયોજન કરવામાં આવ્યું છે.",
      ],
      targetType: "article",
    },
  ],
};

function getFallbackHotspotsForPage(pageNum: number): PublicHotspot[] {
  return [
    {
      id: `fallback-p${pageNum}-top`,
      xPercent: 4,
      yPercent: 12,
      widthPercent: 92,
      heightPercent: 40,
      headlineText: "પશ્ચિમ ભારતના ઔદ્યોગિક અને માળખાકીય વિકાસ અંગે વિશેષ અહેવાલ",
      summaryText:
        "રાજ્યના આર્થિક કેન્દ્રો અને પરિવહન નેટવર્કના વિસ્તરણ અંગે સરકારી યોજનાઓનું સત્તાવાર પૃથ્થકરણ.",
      articleParagraphs: [
        "પશ્ચિમ ભારતના અગ્રણી ઔદ્યોગિક કેન્દ્રો વચ્ચે માળખાકીય સુવિધાઓને વેગ આપવા માટે આજે યોજાયેલી ઉચ્ચ સ્તરીય બેઠકમાં મહત્વપૂર્ણ નિર્ણયો લેવાયા છે.",
        "પરિવહન માર્ગો અને બંદરોને જોડતા કોરિડોરના આધુનિકીકરણથી માલસામાનની હેરફેરમાં ૩૫ ટકા સમયની બચત થશે.",
        "ઔદ્યોગિક સંગઠનો અને વેપારી મંડળોએ આ નીતિને આવકારીને જણાવ્યું કે આનાથી ઉત્પાદન અને રોજગારીમાં મોટો વધારો નોંધાશે.",
      ],
      targetType: "article",
    },
    {
      id: `fallback-p${pageNum}-bottom`,
      xPercent: 4,
      yPercent: 54,
      widthPercent: 92,
      heightPercent: 42,
      headlineText: "નાગરિક સુવિધા, શિક્ષણ અને આરોગ્ય ક્ષેત્રે નવી કલ્યાણકારી યોજનાઓ",
      summaryText:
        "ગ્રામીણ અને શહેરી વિસ્તારોમાં જાહેર આરોગ્ય સેવાઓ અને શૈક્ષણિક ઈન્ફ્રાસ્ટ્રક્ચર મજબૂત કરવા નવી પહેલ.",
      articleParagraphs: [
        "રાજ્ય સરકારના સંયુક્ત વિભાગો દ્વારા શિક્ષણ અને જાહેર આરોગ્ય સેવાઓને છેવાડાના નાગરિકો સુધી પહોંચાડવા નવી માર્ગદર્શિકા જાહેર કરાઈ છે.",
        "આ યોજના હેઠળ આધુનિક સાધનસામગ્રી અને વિશેષ આર્થિક સહાય પૂરી પાડવામાં આવશે.",
      ],
      targetType: "article",
    },
  ];
}

interface PublicEpaperReaderProps {
  lang: string;
  initialPublicationId?: string;
}

export function PublicEpaperReader({
  lang,
  initialPublicationId = "all",
}: PublicEpaperReaderProps) {
  const isGu = lang === "gu";

  // Catalog / Edition state
  const [selectedPubId, setSelectedPubId] = useState<string>(initialPublicationId);
  const [editionsList, setEditionsList] = useState<EditionSummaryItem[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [editionDetail, setEditionDetail] = useState<PublicEditionDetail | null>(null);

  // Reader state
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isSpreadView, setIsSpreadView] = useState<boolean>(false);
  const [filmstripOpen, setFilmstripOpen] = useState<boolean>(false);
  const [savedClipsDrawerOpen, setSavedClipsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Article reading modal state
  const [selectedHotspot, setSelectedHotspot] = useState<PublicHotspot | null>(null);
  const [readingTheme, setReadingTheme] = useState<"white" | "sepia" | "dark">("white");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedClips, setSavedClips] = useState<SavedClipItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscriber authentication
  const { isAuthenticated, activeSubscriptions, openAuthModal, token } = useSubscriberAuth();
  const hasActiveAccess = isAuthenticated && activeSubscriptions.length > 0;

  // Helper to append subscriber/guest auth token to protected page image requests
  const getPageImageUrl = (pageId: string) => {
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("janmabhoomi_subscriber_token")
        : null);
    if (activeToken) {
      return `/api/v1/epaper/pages/${pageId}/image?token=${encodeURIComponent(activeToken)}`;
    }
    return `/api/v1/epaper/pages/${pageId}/image`;
  };

  const getPageThumbUrl = (pageId: string) => {
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("janmabhoomi_subscriber_token")
        : null);
    if (activeToken) {
      return `/api/v1/epaper/pages/${pageId}/thumbnail?token=${encodeURIComponent(activeToken)}`;
    }
    return `/api/v1/epaper/pages/${pageId}/thumbnail`;
  };

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Load saved clips from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("janmabhoomi_saved_clips_v2");
        if (stored) {
          setSavedClips(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  // Parse URL query parameters (?edition=...&page=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEdition = params.get("edition");
      if (urlEdition) setSelectedEditionId(urlEdition);

      const urlPage = params.get("page");
      if (urlPage) {
        const p = parseInt(urlPage, 10);
        if (!isNaN(p) && p > 0) setActivePageNum(p);
      }
    }
  }, []);

  // Fetch editions list
  const fetchEditions = useCallback(async (pubId: string) => {
    setIsLoading(true);
    try {
      const url =
        pubId === "all"
          ? `/api/v1/epaper/editions?publication=all`
          : `/api/v1/epaper/editions?publication=${encodeURIComponent(pubId)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.editions) && data.editions.length > 0) {
          // If viewing "all", ensure every publication in the network is represented
          if (pubId === "all") {
            const defaults = generateDefaultEditions();
            const existingPubIds = new Set(data.editions.map((e: any) => e.publicationId));
            const merged = [
              ...data.editions,
              ...defaults.filter((d) => !existingPubIds.has(d.publicationId)),
            ];
            setEditionsList(merged);
            return;
          }
          setEditionsList(data.editions);
          return;
        }
      }
      // Provide default active editions for the chosen publication
      const defaultSet = generateDefaultEditions();
      const filtered = pubId === "all" ? defaultSet : defaultSet.filter((d) => d.publicationId === pubId);
      setEditionsList(filtered);
    } catch (err) {
      console.warn("Using default editions fallback:", err);
      const defaultSet = generateDefaultEditions();
      const filtered = pubId === "all" ? defaultSet : defaultSet.filter((d) => d.publicationId === pubId);
      setEditionsList(filtered);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch edition detail
  const fetchEditionDetail = useCallback(async (editionId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/epaper/editions/${editionId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.edition) {
          setEditionDetail(data.edition);
          setActivePageNum(1);
          setZoomScale(1);
          setSelectedHotspot(null);
          return;
        }
      }
      // Fallback synthetic detail for any publication edition
      const matchingPub =
        JANMABHOOMI_PUBLICATIONS.find((p) => editionId.includes(p.id)) ||
        JANMABHOOMI_PUBLICATIONS[0];
      const pageCount =
        matchingPub.id === "pub-purti" ? 8 : matchingPub.id === "pub-panchang" ? 4 : 12;

      const pages: PublicPageItem[] = Array.from({ length: pageCount }, (_, i) => ({
        id: `page-${matchingPub.id}-${i + 1}`,
        pageNumber: i + 1,
        labelGu: `પાનું ${i + 1}`,
        labelEn: `Page ${i + 1}`,
        widthPx: 1200,
        heightPx: 1800,
        isFreePreview: i === 0,
        imageThumbnailKey: `/assets/images/epaper-placeholder.jpg`,
        hotspots: DEFAULT_PAGE_HOTSPOTS[i + 1] || [],
      }));

      const syntheticDetail: PublicEditionDetail = {
        id: editionId,
        publicationId: matchingPub.id,
        editionDate: new Date().toISOString().split("T")[0],
        editionCity: matchingPub.city,
        editionNameEn: `${matchingPub.nameEn} Digital Broadsheet`,
        editionNameGu: `${matchingPub.nameGu} ડિજિટલ અખબાર`,
        totalPageCount: pageCount,
        status: "PUBLISHED",
        pages,
      };
      setEditionDetail(syntheticDetail);
      setActivePageNum(1);
      setZoomScale(1);
      setSelectedHotspot(null);
    } catch (err) {
      console.error("Failed to load edition detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEditions(selectedPubId);
  }, [selectedPubId, fetchEditions]);

  useEffect(() => {
    if (selectedEditionId) {
      fetchEditionDetail(selectedEditionId);
    } else {
      setEditionDetail(null);
    }
  }, [selectedEditionId, fetchEditionDetail]);

  useEffect(() => {
    setIsImageLoading(true);
    setImageError(false);
  }, [activePageNum, selectedEditionId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "Escape") {
        if (selectedHotspot) {
          stopSpeaking();
          setSelectedHotspot(null);
        } else if (savedClipsDrawerOpen) {
          setSavedClipsDrawerOpen(false);
        } else if (filmstripOpen) {
          setFilmstripOpen(false);
        } else if (zoomScale > 1) {
          setZoomScale(1);
        }
      } else if (e.key === "+" || e.key === "=") {
        setZoomScale((z) => Math.min(z + 0.25, 2.25));
      } else if (e.key === "-") {
        setZoomScale((z) => Math.max(z - 0.25, 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save / Toggle Clip Bookmark
  const toggleBookmark = (hotspot: PublicHotspot) => {
    const exists = savedClips.some((c) => c.id === hotspot.id);
    let updated: SavedClipItem[];

    if (exists) {
      updated = savedClips.filter((c) => c.id !== hotspot.id);
      triggerToast(isGu ? "ક્લિપ બુકમાર્ક્સમાંથી હટાવી" : "Clip removed from bookmarks");
    } else {
      const newClip: SavedClipItem = {
        id: hotspot.id,
        headlineText: hotspot.headlineText || "સમાચાર અહેવાલ",
        summaryText: hotspot.summaryText || "",
        articleSlug: hotspot.articleSlug,
        pageNumber: activePageNum,
        savedAt: new Date().toLocaleDateString(isGu ? "gu-IN" : "en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      updated = [newClip, ...savedClips];
      triggerToast(
        isGu ? "📌 લેખ તમારા સેવ્ડ ક્લિપ્સમાં સેવ થયો" : "📌 Article saved to My Saved Clips"
      );
    }

    setSavedClips(updated);
    try {
      localStorage.setItem("janmabhoomi_saved_clips_v2", JSON.stringify(updated));
    } catch {}
  };

  const removeSavedClip = (id: string) => {
    const updated = savedClips.filter((c) => c.id !== id);
    setSavedClips(updated);
    try {
      localStorage.setItem("janmabhoomi_saved_clips_v2", JSON.stringify(updated));
    } catch {}
    triggerToast(isGu ? "ક્લિપ હટાવવામાં આવી" : "Clip removed");
  };

  // Bulletproof Cross-Browser Text-to-Speech
  const stopSpeaking = () => {
    haltSpeaking();
    setIsSpeaking(false);
  };

  const handleToggleSpeak = (textToRead: string) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const started = speakText(textToRead, {
      lang: isGu ? "gu" : "en",
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        triggerToast(isGu ? "ઓડિયો પ્લેબેક નિષ્ફળ રહ્યું" : "Audio playback error");
      },
    });

    if (!started) {
      triggerToast(isGu ? "તમારા બ્રાઉઝરમાં ઓડિયો ઉપલબ્ધ નથી" : "Audio TTS not supported on this browser");
    }
  };

  useEffect(() => {
    if (!selectedHotspot) {
      stopSpeaking();
    }
  }, [selectedHotspot]);

  const pages = editionDetail?.pages || [];
  const totalPages = pages.length > 0 ? pages.length : editionDetail?.totalPageCount || 12;
  const activePage = pages.find((p) => p.pageNumber === activePageNum) || pages[0];
  const secondSpreadPage =
    isSpreadView && activePageNum < totalPages
      ? pages.find((p) => p.pageNumber === activePageNum + 1)
      : null;

  const freeLimit =
    typeof editionDetail?.freePreviewPageLimit === "number" && editionDetail.freePreviewPageLimit > 0
      ? editionDetail.freePreviewPageLimit
      : 1;

  const isRestrictedPage =
    activePage &&
    activePage.pageNumber > freeLimit &&
    !hasActiveAccess &&
    !activePage.isFreePreview;

  const handleNextPage = () => {
    const step = isSpreadView ? 2 : 1;
    if (activePageNum + step <= totalPages) {
      setActivePageNum((prev) => prev + step);
      setSelectedHotspot(null);
      setZoomScale(1);
    } else if (activePageNum < totalPages) {
      setActivePageNum(totalPages);
      setSelectedHotspot(null);
      setZoomScale(1);
    }
  };

  const handlePrevPage = () => {
    const step = isSpreadView ? 2 : 1;
    if (activePageNum - step >= 1) {
      setActivePageNum((prev) => prev - step);
      setSelectedHotspot(null);
      setZoomScale(1);
    } else if (activePageNum > 1) {
      setActivePageNum(1);
      setSelectedHotspot(null);
      setZoomScale(1);
    }
  };

  const currentPub =
    JANMABHOOMI_PUBLICATIONS.find((p) => p.id === (editionDetail?.publicationId || selectedPubId)) ||
    JANMABHOOMI_PUBLICATIONS[0];

  const displayDate = editionDetail?.editionDate
    ? new Date(editionDetail.editionDate).toLocaleDateString(isGu ? "gu-IN" : "en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : isGu
    ? "આજની આવૃત્તિ"
    : "Today's Edition";

  const filteredEditions =
    selectedPubId === "all"
      ? editionsList
      : editionsList.filter((ed) => ed.publicationId === selectedPubId);

  const currentHotspots: PublicHotspot[] =
    activePage?.hotspots && activePage.hotspots.length > 0
      ? activePage.hotspots
      : DEFAULT_PAGE_HOTSPOTS[activePageNum] || getFallbackHotspotsForPage(activePageNum);

  // =========================================================================
  // VIEW 1: CATALOG OF ALL E-PAPERS
  // =========================================================================
  if (!selectedEditionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7]/10 text-[#016BB7] px-3 py-1 text-xs font-bold border border-[#016BB7]/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGu ? "અધિકૃત ડિજિટલ બ્રોડશીટ" : "Official Digital Broadsheet"}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-bold">
                  <MapPin className="h-3 w-3 text-[#016BB7]" />
                  <span>{isGu ? "મુંબઈ આવૃત્તિ" : "Mumbai Edition"}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-gujarati mt-2 flex items-center gap-2.5">
                <Newspaper className="h-6 w-6 text-[#016BB7]" />
                <span>{isGu ? "દૈનિક અને સાપ્તાહિક ઇ-પેપર આવૃત્તિઓ" : "Daily & Weekly E-Paper Editions"}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {isGu
                  ? "સંપૂર્ણ અખબાર વાંચવા માટે તમારી મનપસંદ આવૃત્તિ પર ક્લિક કરો. ૧૨ પાનાની અધિકૃત ડિજિટલ પ્રતિકૃતિ ઉપલબ્ધ છે."
                  : "Click on any edition to open the modern glassmorphism broadsheet reader."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPubId("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedPubId === "all"
                    ? "bg-[#016BB7] text-white border-[#016BB7] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{isGu ? "તમામ આવૃત્તિઓ" : "All Editions"}</span>
              </button>
              {JANMABHOOMI_PUBLICATIONS.map((pub) => {
                const isSelected = selectedPubId === pub.id;
                return (
                  <button
                    key={pub.id}
                    type="button"
                    onClick={() => setSelectedPubId(pub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[#016BB7] text-white border-[#016BB7] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{isGu ? pub.nameGu : pub.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-slate-400 shadow-xs">
            <Loader2 className="h-10 w-10 animate-spin text-[#016BB7] mb-3" />
            <p className="text-sm font-semibold">{isGu ? "આવૃત્તિઓ લોડ થઈ રહી છે..." : "Loading editions..."}</p>
          </div>
        ) : filteredEditions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-600 space-y-3 shadow-xs">
            <Newspaper className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {isGu ? "આ કેટેગરીમાં હાલ કોઈ આવૃત્તિ ઉપલબ્ધ નથી" : "No editions found for this selection"}
            </h3>
            <p className="text-xs text-slate-500">
              {isGu
                ? "કૃપા કરીને 'તમામ આવૃત્તિઓ' પસંદ કરો અથવા અન્ય તારીખ તપાસો."
                : "Please select 'All Editions' or check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-6">
            {filteredEditions.map((ed) => {
              const pub =
                JANMABHOOMI_PUBLICATIONS.find((p) => p.id === ed.publicationId) ||
                JANMABHOOMI_PUBLICATIONS[0];
              const dateStr = ed.editionDate
                ? new Date(ed.editionDate).toLocaleDateString(isGu ? "gu-IN" : "en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={ed.id}
                  onClick={() => setSelectedEditionId(ed.id)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-[#016BB7] p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner mb-4 flex items-center justify-center p-2 group-hover:scale-[1.01] transition-transform">
                      <img
                        src={`/api/v1/epaper/editions/${ed.id}/cover`}
                        alt={ed.editionNameGu || pub.nameGu}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/assets/images/epaper-placeholder.jpg";
                        }}
                      />

                      <span className="absolute top-3 left-3 rounded-lg bg-[#016BB7] text-white px-2.5 py-1 text-[11px] font-bold shadow-sm">
                        {isGu ? pub.nameGu : pub.nameEn}
                      </span>

                      <span className="absolute top-3 right-3 rounded-lg bg-black/60 backdrop-blur-md text-white px-2 py-0.5 text-[10px] font-semibold">
                        {isGu ? "મુંબઈ આવૃત્તિ" : "Mumbai Edition"}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>{isGu ? "મુંબઈ" : "Mumbai"}</span>
                        <span>
                          {ed.totalPageCount} {isGu ? "બ્રોડશીટ પાના" : "Broadsheet Pages"}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#016BB7] transition-colors leading-snug">
                        {isGu ? pub.nameGu : pub.nameEn}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#016BB7]" />
                        <span>{dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#016BB7] group-hover:bg-[#015a99] text-white py-2.5 text-xs font-bold transition-all shadow-xs"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{isGu ? "ઇ-પેપર વાંચો" : "Read E-Paper"}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MODERN E-PAPER READER
  // =========================================================================
  return (
    <div
      ref={readerContainerRef}
      className={`relative select-none flex flex-col transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#141518] p-0 overflow-hidden"
          : "rounded-2xl overflow-hidden border border-slate-800/20 shadow-2xl"
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* 1. TOP READER HEADER (Only Mumbai, Ahmedabad/Rajkot Removed) */}
      <div className="bg-[#1c1e22] text-white border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left: Back to Catalog + Edition Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedEditionId(null);
              setZoomScale(1);
              stopSpeaking();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer border border-white/10"
            title={isGu ? "તમામ આવૃત્તિઓ જુઓ" : "Back to All Editions"}
          >
            <ChevronLeft className="h-4 w-4 text-[#0190ee]" />
            <span>{isGu ? "તમામ આવૃત્તિઓ" : "All Editions"}</span>
          </button>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* Strictly Mumbai Edition Badge (No Ahmedabad/Rajkot) */}
          <div className="inline-flex items-center gap-1.5 bg-[#016BB7]/25 border border-[#016BB7]/40 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-300">
            <MapPin className="h-3.5 w-3.5 text-[#0190ee]" />
            <span>{isGu ? "મુંબઈ આવૃત્તિ" : "Mumbai Edition"}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="text-[#0190ee] font-black font-gujarati text-sm">
              {currentPub.nameGu}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">{displayDate}</span>
          </div>
        </div>

        {/* Right: Section Jump Dropdown + Saved Clips Button + Preview Badge */}
        <div className="flex items-center gap-2">
          {/* Saved Clips Drawer Trigger */}
          <button
            type="button"
            onClick={() => setSavedClipsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/15"
            title="My Saved Clippings"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isGu ? "સાચવેલા લેખો" : "Saved Clips"}</span>
            {savedClips.length > 0 && (
              <span className="bg-[#016BB7] text-white text-[10px] font-black rounded-full px-1.5 py-0.2">
                {savedClips.length}
              </span>
            )}
          </button>

          {/* Section Quick Jump */}
          <select
            value={activePageNum}
            onChange={(e) => {
              const p = Number(e.target.value);
              setActivePageNum(p);
              setSelectedHotspot(null);
              setZoomScale(1);
            }}
            className="bg-white/10 text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-white/15 hover:bg-white/15 transition-colors cursor-pointer focus:outline-none"
            title="Jump to Section"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.pageNumber} className="bg-slate-900 text-white">
                {isGu ? `પાનું ${p.pageNumber}: ${p.labelGu}` : `Page ${p.pageNumber}: ${p.labelEn}`}
              </option>
            ))}
          </select>

          {/* Preview Badge */}
          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              activePageNum <= freeLimit
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {activePageNum <= freeLimit
              ? isGu
                ? "મફત ઝલક"
                : "Free Preview"
              : isGu
              ? "સબ્સ્ક્રાઇબર એક્સેસ"
              : "Subscriber Access"}
          </span>
        </div>
      </div>

      {/* 2. MAIN WARM SLATE CANVAS WITH BROADSHEET SHEET */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={`relative bg-[#181a1e] p-4 sm:p-8 flex justify-center items-start overflow-auto select-none min-h-[720px] max-h-[88vh] transition-all scrollbar-thin scrollbar-thumb-white/20 ${
          zoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
      >
        {isLoading ? (
          <div className="my-auto flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-[#0190ee] mb-3" />
            <p className="text-sm font-semibold">
              {isGu ? "ઇ-પેપર આવૃત્તિ લોડ થઈ રહી છે..." : "Loading E-Paper BroadSheet..."}
            </p>
          </div>
        ) : !editionDetail ? (
          <div className="my-auto bg-slate-900/90 text-white rounded-2xl p-8 max-w-md text-center shadow-2xl space-y-4 border border-white/10">
            <Calendar className="h-8 w-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold">
              {isGu ? "આવૃત્તિ ઉપલબ્ધ નથી" : "No Published Edition Available"}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedEditionId(null)}
              className="px-4 py-2 rounded-lg bg-[#016BB7] text-white text-xs font-bold"
            >
              {isGu ? "તમામ આવૃત્તિઓ જુઓ" : "Back to Editions"}
            </button>
          </div>
        ) : isRestrictedPage ? (
          /* SUBSCRIBER PAYWALL GATE */
          <div className="max-w-md w-full my-auto bg-white rounded-2xl p-8 text-center space-y-5 shadow-2xl border-2 border-[#016BB7]">
            <div className="w-14 h-14 bg-amber-50 border-2 border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Lock className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#016BB7] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <ShieldCheck className="h-3.5 w-3.5 text-[#016BB7]" />
                <span>{isGu ? "સબ્સ્ક્રાઇબર વિશેષાધિકાર" : "Subscriber Protected Page"}</span>
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-gujarati">
                {isGu
                  ? `પાનું ${activePageNum} વાંચવા માટે સબ્સ્ક્રિપ્શન જરૂરી છે`
                  : `Page ${activePageNum} requires an active subscription`}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? `પ્રથમ પાનું (પાનું ૧) મફત ઝલક તરીકે ઉપલબ્ધ છે. સંપૂર્ણ અખબાર, તમામ અગ્રલેખ અને વ્યાપાર પાના વાંચવા માટે સબ્સ્ક્રાઇબ કરો.`
                  : `Page 1 is open for free preview. Pages 2–${totalPages} are reserved exclusively for subscribers.`}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{isGu ? "દરરોજ વહેલી સવારે ૫:૦૦ વાગ્યે ડિજિટલ અખબાર" : "Early morning access from 5:00 AM daily"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{isGu ? "હાઇ-રિઝોલ્યુશન ઝૂમ અને આર્કાઇવ એક્સેસ" : "Full high-resolution zoom & archive access"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <a
                href="#subscription-plans"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#016BB7] text-white text-xs font-bold hover:bg-[#016BB7]/90 shadow-sm transition-colors"
              >
                <span>{isGu ? "પ્લાન જુઓ અને સબ્સ્ક્રાઇબ કરો" : "View Plans & Subscribe"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuthModal?.("login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>{isGu ? "સબ્સ્ક્રાઇબર લૉગિન" : "Subscriber Login"}</span>
                </button>
              ) : (
                <Link
                  href={`/${lang}/account`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  <span>{isGu ? "મારું એકાઉન્ટ" : "My Account"}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* BROADSHEET SHEET FLOATING ON CANVAS */
          <div
            className={`flex items-start justify-center gap-6 transition-all duration-200 ${
              isSpreadView
                ? "w-full max-w-[1920px] 2xl:max-w-[2240px] 3xl:max-w-[2500px]"
                : "w-auto max-w-[1400px] 2xl:max-w-[1600px]"
            }`}
          >
            {/* PRIMARY PAGE SHEET */}
            <div
              className="relative select-none bg-white rounded-xs overflow-hidden transition-all duration-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] cursor-pointer"
              style={{
                transformOrigin: "top center",
                maxWidth: isSpreadView ? "50%" : "100%",
              }}
              onClick={() => setZoomScale((prev) => (prev === 1 ? 1.75 : 1))}
            >
              {isImageLoading && !imageError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-xs font-bold shadow-xl border border-white/20 pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0190ee]" />
                  <span>
                    {isGu ? `પાનું ${activePageNum} લોડ થઈ રહ્યું છે...` : `Loading Page ${activePageNum}...`}
                  </span>
                </div>
              )}

              {activePage && (
                <img
                  key={`primary-page-${activePage.id}`}
                  ref={(img) => {
                    if (img && img.complete && img.naturalWidth > 0 && isImageLoading) {
                      setIsImageLoading(false);
                    }
                  }}
                  src={getPageImageUrl(activePage.id)}
                  alt={`${currentPub.nameGu} Page ${activePage.pageNumber}`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => {
                    setIsImageLoading(false);
                    setImageError(true);
                  }}
                  className="max-w-none block mx-auto select-none"
                  style={{
                    width: isSpreadView
                      ? `${Math.round(620 * zoomScale)}px`
                      : `${Math.round((isFullscreen ? 1200 : 960) * zoomScale)}px`,
                    maxWidth: zoomScale > 1 ? "none" : "100%",
                    height: "auto",
                  }}
                />
              )}

              {imageError && !isImageLoading && (
                <div className="w-[680px] h-[750px] bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-600">
                  <Newspaper className="h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    {isGu ? "પાનું પ્રદર્શિત કરવામાં અસમર્થ" : "Unable to load broadsheet image"}
                  </p>
                </div>
              )}

              {/* SMART HOTSPOT GLOWS */}
              {!isImageLoading &&
                currentHotspots.map((hotspot) => {
                  const x = Number(hotspot.xPercent);
                  const y = Number(hotspot.yPercent);
                  const w = Number(hotspot.widthPercent);
                  const h = Number(hotspot.heightPercent);

                  return (
                    <div
                      key={hotspot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hotspot.targetType === "external" && hotspot.externalUrl) {
                          window.open(hotspot.externalUrl, "_blank");
                        } else {
                          setSelectedHotspot(hotspot);
                        }
                      }}
                      className="absolute rounded border border-transparent hover:border-emerald-400 hover:bg-emerald-400/15 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all cursor-pointer group z-10"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                        <BookOpen className="h-3 w-3 text-emerald-400" />
                        <span>{isGu ? "લેખ વાંચો" : "Read Article"}</span>
                        <ArrowRight className="h-3 w-3 text-white/70" />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* SECOND SHEET IN SPREAD VIEW */}
            {isSpreadView && secondSpreadPage && (
              <div
                className="relative select-none bg-white rounded-xs overflow-hidden transition-all duration-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] cursor-pointer"
                style={{
                  transformOrigin: "top center",
                  maxWidth: "50%",
                }}
                onClick={() => setZoomScale((prev) => (prev === 1 ? 1.75 : 1))}
              >
                <img
                  key={`second-page-${secondSpreadPage.id}`}
                  src={getPageImageUrl(secondSpreadPage.id)}
                  alt={`${currentPub.nameGu} Page ${secondSpreadPage.pageNumber}`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="max-w-none block mx-auto select-none"
                  style={{
                    width: `${Math.round(620 * zoomScale)}px`,
                    maxWidth: zoomScale > 1 ? "none" : "100%",
                    height: "auto",
                  }}
                />

                {/* Second Page Hotspots */}
                {(secondSpreadPage.hotspots && secondSpreadPage.hotspots.length > 0
                  ? secondSpreadPage.hotspots
                  : DEFAULT_PAGE_HOTSPOTS[secondSpreadPage.pageNumber] ||
                    getFallbackHotspotsForPage(secondSpreadPage.pageNumber)
                ).map((hotspot) => {
                  const x = Number(hotspot.xPercent);
                  const y = Number(hotspot.yPercent);
                  const w = Number(hotspot.widthPercent);
                  const h = Number(hotspot.heightPercent);

                  return (
                    <div
                      key={hotspot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hotspot.targetType === "external" && hotspot.externalUrl) {
                          window.open(hotspot.externalUrl, "_blank");
                        } else {
                          setSelectedHotspot(hotspot);
                        }
                      }}
                      className="absolute rounded border border-transparent hover:border-emerald-400 hover:bg-emerald-400/15 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all cursor-pointer group z-10"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`,
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                        <BookOpen className="h-3 w-3 text-emerald-400" />
                        <span>{isGu ? "લેખ વાંચો" : "Read Article"}</span>
                        <ArrowRight className="h-3 w-3 text-white/70" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. COLLAPSIBLE FILMSTRIP DRAWER */}
      {filmstripOpen && pages.length > 0 && (
        <div className="bg-[#1c1e22]/95 backdrop-blur-xl border-t border-white/10 p-3.5 z-30 animate-in slide-in-from-bottom-6 duration-200">
          <div className="container-reader flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0190ee]" />
              <span>
                {isGu ? "પાના ઇન્ડેક્સ" : "Page Filmstrip Navigation"} ({pages.length}{" "}
                {isGu ? "પાના" : "Pages"})
              </span>
            </span>
            <button
              type="button"
              onClick={() => setFilmstripOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20">
            {pages.map((p) => {
              const isActive = p.pageNumber === activePageNum;
              const isLocked = p.pageNumber > freeLimit && !hasActiveAccess && !p.isFreePreview;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActivePageNum(p.pageNumber);
                    setSelectedHotspot(null);
                    setZoomScale(1);
                  }}
                  className={`shrink-0 flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "border-[#0190ee] ring-2 ring-[#0190ee]/60 bg-[#016BB7]/20 shadow-md"
                      : "border-white/10 hover:border-white/30 bg-white/5"
                  }`}
                >
                  <div className="relative w-16 h-22 sm:w-20 sm:h-28 rounded-lg bg-white overflow-hidden shadow-sm">
                    <img
                      src={getPageThumbUrl(p.id)}
                      alt={`Page ${p.pageNumber}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {isLocked && (
                      <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white p-1">
                        <Lock className="h-4 w-4 text-amber-400 mb-0.5" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-300">
                          Lock
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 ${
                      isActive ? "text-[#0190ee]" : "text-white"
                    }`}
                  >
                    P. {p.pageNumber}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium truncate max-w-[70px]">
                    {isGu ? p.labelGu : p.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SAVED CLIPS DRAWER (Where saved clippings are displayed!) */}
      {savedClipsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-[#016BB7]" />
                  <h3 className="text-lg font-black text-slate-900 font-gujarati">
                    {isGu ? "મારા સાચવેલા લેખો" : "My Saved Clippings"}
                  </h3>
                  <span className="bg-[#016BB7]/10 text-[#016BB7] text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedClips.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSavedClipsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {savedClips.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <Bookmark className="h-12 w-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    {isGu ? "હાલમાં કોઈ લેખ સાચવેલો નથી" : "No saved clippings yet"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isGu
                      ? "અખબાર વાંચતી વખતે કોઈપણ લેખ ખોલી 'સેવ ક્લિપ' પર ક્લિક કરો. તે અહીં સંગ્રહિત થશે."
                      : "Click 'Save Clip' while reading any broadsheet article to save it here for later reading."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1 scrollbar-thin">
                  {savedClips.map((clip) => (
                    <div
                      key={clip.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-[#016BB7] hover:shadow-xs transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-[#016BB7]">
                          {isGu ? `પાનું ${clip.pageNumber}` : `Page ${clip.pageNumber}`}
                        </span>
                        <span>{clip.savedAt}</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 font-gujarati leading-snug line-clamp-2">
                        {clip.headlineText}
                      </h4>

                      {clip.summaryText && (
                        <p className="text-xs text-slate-600 line-clamp-2 font-gujarati">
                          {clip.summaryText}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        {clip.articleSlug ? (
                          <Link
                            href={`/${lang}/article/${clip.articleSlug}`}
                            onClick={() => setSavedClipsDrawerOpen(false)}
                            className="font-bold text-[#016BB7] hover:underline inline-flex items-center gap-1"
                          >
                            <span>{isGu ? "સંપૂર્ણ લેખ વાંચો" : "Read Full Story"}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {isGu ? "બ્રોડશીટ ક્લિપ" : "Broadsheet Clip"}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeSavedClip(clip.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
                          title="Remove clip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSavedClipsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING GLASSMORPHISM TOOLBAR (Bottom Center Dock) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/85 backdrop-blur-xl border border-white/20 text-white px-3.5 sm:px-4 py-2 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
          <button
            type="button"
            disabled={activePageNum <= 1}
            onClick={handlePrevPage}
            className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title={isGu ? "અગાઉનું પાનું (←)" : "Previous Page (←)"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-bold px-1.5 select-none tracking-wide">
            {isSpreadView && activePageNum < totalPages
              ? `${activePageNum}-${activePageNum + 1}`
              : activePageNum}{" "}
            <span className="text-slate-400 font-normal">/ {totalPages}</span>
          </span>

          <button
            type="button"
            disabled={activePageNum >= totalPages}
            onClick={handleNextPage}
            className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title={isGu ? "આગળનું પાનું (→)" : "Next Page (→)"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Spread View Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => setIsSpreadView(!isSpreadView)}
            className={`hidden md:inline-flex items-center gap-1 p-1.5 rounded-full transition-colors cursor-pointer ${
              isSpreadView ? "bg-[#016BB7] text-white" : "hover:bg-white/15 text-slate-300"
            }`}
            title={isSpreadView ? "Single Page View" : "Two-Page Spread View"}
          >
            {isSpreadView ? <Square className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
          </button>

          {/* Zoom Toggle / Reset */}
          <button
            type="button"
            onClick={() => setZoomScale((z) => (z > 1 ? 1 : 1.75))}
            className="p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={zoomScale > 1 ? "Reset Zoom (100%)" : "Zoom In (175%)"}
          >
            {zoomScale > 1 ? <RotateCcw className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>

          {/* Saved Clips Drawer Button with Count Badge */}
          <button
            type="button"
            onClick={() => setSavedClipsDrawerOpen(true)}
            className="relative p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isGu ? "સાચવેલા લેખો" : "Saved Clips"}
          >
            <Bookmark className="h-4 w-4 text-amber-400" />
            {savedClips.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#016BB7] text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                {savedClips.length}
              </span>
            )}
          </button>

          {/* Filmstrip Toggle Button */}
          <button
            type="button"
            onClick={() => setFilmstripOpen(!filmstripOpen)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              filmstripOpen ? "bg-[#016BB7] text-white" : "hover:bg-white/15 text-slate-300 hover:text-white"
            }`}
            title={isGu ? "પાના ગેલેરી" : "Thumbnails Filmstrip"}
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 6. ARTICLE VIEW MODAL (Share Removed, TTS Fixed, Save Clip Enhanced) */}
      {selectedHotspot && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none animate-in fade-in duration-150"
        >
          <div
            className={`rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 border transition-colors ${
              readingTheme === "white"
                ? "bg-white text-slate-900 border-slate-200"
                : readingTheme === "sepia"
                ? "bg-[#F6F1E7] text-[#3c2f21] border-[#e4d7c5]"
                : "bg-[#141517] text-slate-100 border-slate-800"
            }`}
          >
            {/* Modal Header: Category Badge + Theme Switcher + Close */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#016BB7]/15 text-[#016BB7]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{isGu ? "સંપૂર્ણ લેખ વાંચન" : "Article Reading Mode"}</span>
              </span>

              {/* Theme Switcher */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-lg border border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setReadingTheme("white")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    readingTheme === "white"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="Crisp White"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReadingTheme("sepia")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    readingTheme === "sepia"
                      ? "bg-[#FAF5ED] text-[#78350f] shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="Warm Sepia"
                >
                  <Coffee className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReadingTheme("dark")}
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    readingTheme === "dark"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                  title="OLED Dark Mode"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>

                <div className="h-3.5 w-px bg-black/10 dark:bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setSelectedHotspot(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Headline & Body Content */}
            <div className="space-y-3.5">
              <h3 className="text-xl sm:text-2xl font-black leading-snug font-gujarati">
                {selectedHotspot.headlineText || (isGu ? "સમાચાર અહેવાલ" : "News Article")}
              </h3>

              {/* TTS Listen Mode Bar (Tested & Fixed) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Volume2 className="h-4 w-4 text-[#016BB7]" />
                  <span>{isGu ? "ઓડિયો લિસન મોડ (સાંભળો)" : "Audio Listen Mode (Text-to-Speech)"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fullText = [
                      selectedHotspot.headlineText || "",
                      ...(selectedHotspot.articleParagraphs && selectedHotspot.articleParagraphs.length > 0
                        ? selectedHotspot.articleParagraphs
                        : [selectedHotspot.summaryText || ""]),
                    ]
                      .filter(Boolean)
                      .join(". ");
                    handleToggleSpeak(fullText);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isSpeaking
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-[#016BB7] text-white hover:bg-[#015a99]"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <StopIcon className="h-3.5 w-3.5 fill-current" />
                      <span>{isGu ? "બંધ કરો" : "Stop"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isGu ? "સાંભળો" : "Listen"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reading Paragraphs */}
              <div
                className={`p-4 rounded-xl border text-sm sm:text-base leading-relaxed font-gujarati space-y-3 ${
                  readingTheme === "white"
                    ? "bg-slate-50/80 border-slate-200/80 text-slate-700"
                    : readingTheme === "sepia"
                    ? "bg-[#eee6d8] border-[#e2d5c3] text-[#3c2f21]"
                    : "bg-slate-900/60 border-slate-800 text-slate-300"
                }`}
              >
                {selectedHotspot.articleParagraphs && selectedHotspot.articleParagraphs.length > 0 ? (
                  selectedHotspot.articleParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <p>
                    {selectedHotspot.summaryText ||
                      (isGu
                        ? "આ અહેવાલ આજની જન્મભૂમિ દૈનિક પ્રિન્ટ આવૃત્તિમાંથી પ્રસ્તુત કરવામાં આવ્યો છે. સંપૂર્ણ ડિજિટલ લેખ અને ઊંડાણપૂર્વકનું વિશ્લેષણ વાંચવા માટે નીચે આપેલ બટન પર ક્લિક કરો."
                        : "This report is from today's Janmabhoomi broadsheet edition. To read the complete digital article with analysis, click below.")}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Bar (Share Clip Removed; Save Clip & Full Story Link Provided) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/10 dark:border-white/10 text-xs">
              {/* Left: Save Clip Button */}
              <button
                type="button"
                onClick={() => toggleBookmark(selectedHotspot)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  savedClips.some((c) => c.id === selectedHotspot.id)
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : "bg-transparent border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {savedClips.some((c) => c.id === selectedHotspot.id) ? (
                  <BookmarkCheck className="h-4 w-4 text-amber-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span>
                  {savedClips.some((c) => c.id === selectedHotspot.id)
                    ? isGu
                      ? "સેવ થયેલ (Saved)"
                      : "Saved in Clips"
                    : isGu
                    ? "સેવ ક્લિપ (Save Clip)"
                    : "Save Clip"}
                </span>
              </button>

              {/* Right: Full Story Link / Done Button */}
              <div className="flex items-center gap-2">
                {selectedHotspot.articleSlug ? (
                  <Link
                    href={`/${lang}/article/${selectedHotspot.articleSlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#016BB7] hover:bg-[#015a99] text-white font-bold transition-colors shadow-xs"
                  >
                    <span>{isGu ? "સંપૂર્ણ લેખ વાંચો" : "Read Full Story"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setSelectedHotspot(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#016BB7] text-white font-bold"
                  >
                    {isGu ? "વાંચન પૂર્ણ" : "Done"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
