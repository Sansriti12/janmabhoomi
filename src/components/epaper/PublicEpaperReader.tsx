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
  ZoomOut,
  RotateCcw,
  Columns,
  Square,
  Play,
  Square as StopIcon,
  MapPin,
  Trash2,
  Scissors,
  PanelLeft,
  List,
} from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { speakText, stopSpeaking as haltSpeaking } from "@/lib/utils/speechHelper";
import { SponsorStrip } from "@/components/ads/SponsorStrip";

export interface PublicHotspot {
  id: string;
  xPercent: number | string;
  yPercent: number | string;
  widthPercent: number | string;
  heightPercent: number | string;
  headlineText?: string;
  subHeadlineText?: string;
  bodyText?: string;
  headlineEn?: string;
  subHeadlineEn?: string;
  bodyTextEn?: string;
  summaryText?: string;
  articleParagraphs?: string[];
  articleParagraphsEn?: string[];
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
  croppedImageDataUrl?: string;
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
    id: "pub-purti",
    code: "JPT",
    nameEn: "Janmabhoomi Purti",
    nameGu: "જન્મભૂમિ પૂર્તિ",
    freqEn: "Special Supplements",
    freqGu: "વિશેષ સાપ્તાહિક પૂર્તિઓ",
    city: "Mumbai",
  },
];

const ALLOWED_EPAPER_PUB_IDS = new Set(JANMABHOOMI_PUBLICATIONS.map((p) => p.id));

const JB_2026_11_16_PAGE_LABELS: Array<{ en: string; gu: string }> = [
  { en: "Page 1 — Front Page", gu: "પાનું ૧ — મુખ્ય પૃષ્ઠ" },
  { en: "Page 2 — Vyapar", gu: "પાનું ૨ — વ્યાપાર" },
  { en: "Page 3 — Main Front News", gu: "પાનું ૩ — મુખ્ય સમાચાર" },
  { en: "Page 4 — Editorial & Views", gu: "પાનું ૪ — અગ્રલેખ અને કલમ-કિતાબ" },
  { en: "Page 5 — Nation & World", gu: "પાનું ૫ — દેશ-વિદેશ" },
  { en: "Page 6 — Saurashtra & Kutch", gu: "પાનું ૬ — ફૂલછાબ-કચ્છમિત્ર સમાચાર" },
  { en: "Page 7 — Mumbai Mahanagar", gu: "પાનું ૭ — મહાનગર મુંબઈ" },
  { en: "Page 8 — Variety & Obituary", gu: "પાનું ૮ — વૈવિધ્ય અને શ્રદ્ધાંજલિ" },
  { en: "Page 9 — Vyapar & Markets", gu: "પાનું ૯ — વ્યાપાર-બજાર" },
  { en: "Page 10 — Vyapar & Economy", gu: "પાનું ૧૦ — વ્યાપાર-અર્થતંત્ર" },
  { en: "Page 11 — Sports", gu: "પાનું ૧૧ — રમતગમત" },
  { en: "Page 12 — Back Page", gu: "પાનું ૧૨ — છેલ્લું પાનું" },
];

function generateDefaultEditions(): EditionSummaryItem[] {
  const today = new Date().toISOString().split("T")[0];
  return JANMABHOOMI_PUBLICATIONS.map((pub) => {
    const isJanmabhoomiPdf = pub.id === "pub-janmabhoomi";
    return {
      id: isJanmabhoomiPdf
        ? "edition-pub-janmabhoomi-2026-11-16"
        : `edition-${pub.id}-latest`,
      publicationId: pub.id,
      editionDate: isJanmabhoomiPdf ? "2026-11-16" : today,
      editionCity: pub.city,
      editionNameEn: isJanmabhoomiPdf
        ? "Janmabhoomi Mumbai — 16 Nov 2026"
        : `${pub.nameEn} Digital Edition`,
      editionNameGu: isJanmabhoomiPdf
        ? "જન્મભૂમિ મુંબઈ — ૧૬ નવેમ્બર ૨૦૨૬"
        : `${pub.nameGu} ડિજિટલ આવૃત્તિ`,
      totalPageCount: pub.id === "pub-purti" || pub.id === "pub-madhuvan" ? 8 : 12,
      status: "PUBLISHED",
      coverImageUrl: isJanmabhoomiPdf
        ? "/assets/epaper/jb-2026-11-16/page-1.jpg"
        : "/assets/images/epaper-placeholder.jpg",
    };
  });
}

// Verified article slugs matched to broadsheet pages
const DEFAULT_PAGE_HOTSPOTS: Record<number, PublicHotspot[]> = {
  1: [
    {
      id: "demo-h1",
      xPercent: 3,
      yPercent: 12,
      widthPercent: 46,
      heightPercent: 38,
      headlineText: "સેન્સેક્સ અને ભારતીય બજારમાં વિદેશી રોકાણકારોનો વિશ્વાસ: વ્યાપાર અને ઉદ્યોગમાં નવો વેગ",
      summaryText:
        "મુંબઈ શેરબજારમાં વિદેશી સંસ્થાકીય રોકાણકારોની લેવાલી અને આર્થિક સુધારાઓના પરિણામે એમએસએમઇ નિકાસ અને બેંકિંગ ક્ષેત્રે મજબૂત વૃદ્ધિ નોંધાઈ.",
      articleParagraphs: [
        "મુંબઈ શેરબજારમાં વિદેશી સંસ્થાકીય રોકાણકારોની સતત લેવાલી અને સકારાત્મક આર્થિક નીતિઓના પરિણામે ભારતીય બજારમાં નવો ઉત્સાહ જોવા મળી રહ્યો છે.",
        "આઈટી, બેંકિંગ અને નિકાસ આધારિત ઉદ્યોગોમાં નોંધપાત્ર વૃદ્ધિ થઈ છે, જ્યારે આરબીઆઈના નવા ક્રેડિટ સેટલમેન્ટ માળખાથી નાના અને મધ્યમ ઉદ્યોગોને મોટી રાહત મળી છે.",
        "બજાર નિષ્ણાતોના મતે ભારતીય અર્થતંત્રના મજબૂત વૃદ્ધિદર અને કોર્પોરેટ કમાણીના સારા પરિણામો આગામી સમયમાં પણ તેજીને વેગ આપશે.",
      ],
      targetType: "article",
      articleSlug: "rbi-msme-export-credit-settlement-framework",
    },
    {
      id: "demo-h2",
      xPercent: 51,
      yPercent: 12,
      widthPercent: 46,
      heightPercent: 28,
      headlineText: "મુંબઈ કોસ્ટલ રોડ અને મેટ્રો ઇન્ટરચેન્જ: દક્ષિણ મુંબઈથી ઉપનગરો સુધી ટ્રાફિક મુક્ત મુસાફરી",
      summaryText:
        "મુંબઈ મહાનગરમાં નવા કોસ્ટલ રોડ અને મેટ્રો કનેક્ટિવિટીથી દક્ષિણ મુંબઈથી પશ્ચિમી ઉપનગરો સુધીનો પ્રવાસ વધુ ઝડપી અને સરળ બન્યો.",
      articleParagraphs: [
        "મુંબઈ મહાનગરમાં મુસાફરોની સુવિધા વધારવા માટે કોસ્ટલ રોડ અને મેટ્રો ઇન્ટરચેન્જ વ્યવસ્થાની સમીક્ષા કરવામાં આવી છે.",
        "નવા કનેક્ટર કાર્યરત થવાથી દક્ષિણ મુંબઈના નરીમાન પોઇન્ટથી પશ્ચિમી ઉપનગરો સુધીની મુસાફરીમાં નોંધપાત્ર સમયની બચત થશે.",
        "આ માર્ગ પર અદ્યતન ટનલ વેન્ટિલેશન સિસ્ટમ અને સીસીટીવી સર્વેલન્સ ગોઠવવામાં આવ્યા છે, જેથી ટ્રાફિક વ્યવસ્થા સુગમ રહેશે.",
      ],
      targetType: "article",
      articleSlug: "mumbai-coastal-metro-interchange-commuter-review",
    },
    {
      id: "demo-h3",
      xPercent: 3,
      yPercent: 52,
      widthPercent: 46,
      heightPercent: 42,
      headlineText: "પશ્ચિમ ભારત દરિયાઈ ફ્રેઇટ કોરિડોર વિસ્તરણ યોજના: બંદરો અને વેપારને નવી ગતિ",
      summaryText:
        "મહારાષ્ટ્ર અને ગુજરાતના મુખ્ય બંદરોને જોડતા માલવાહક કોરિડોરના વિસ્તરણથી નિકાસ અને લોજિસ્ટિક્સ ક્ષેત્રે મોટો ફાયદો.",
      articleParagraphs: [
        "પશ્ચિમ ભારતના અગ્રણી દરિયાઈ બંદરો અને ઔદ્યોગિક કેન્દ્રોને જોડવા માટે નવી ફ્રેઇટ કોરિડોર વિસ્તરણ યોજના જાહેર કરવામાં આવી છે.",
        "આ સુધારાઓથી ભારતીય ઉદ્યોગોને વૈશ્વિક વેપારમાં ઝડપી પરિવહન અને કરકસરભરી લોજિસ્ટિક્સ સુવિધા મળી રહેશે.",
      ],
      targetType: "article",
      articleSlug: "western-india-maritime-freight-corridor-expansion-plan",
    },
    {
      id: "demo-h4",
      xPercent: 51,
      yPercent: 42,
      widthPercent: 46,
      heightPercent: 52,
      headlineText: "અગ્રલેખ: દરિયાકાંઠાના શહેરોમાં શહેરી સ્થિતિસ્થાપકતા અને નાગરિક જવાબદારી",
      summaryText:
        "શહેરી વિકાસ, પારદર્શક વહીવટ અને નાગરિક સુવિધાઓનું સંતુલન એ જ જીવંત મહાનગરોની સાચી ઓળખ છે.",
      articleParagraphs: [
        "દરિયાકાંઠાના મહાનગરોમાં વધતી જતી વસ્તી અને હવામાન પરિવર્તનના પડકારો વચ્ચે શહેરી સ્થિતિસ્થાપકતા અત્યંત મહત્વપૂર્ણ બની છે.",
        "ન્યાયી વહીવટ, આધુનિક માળખાકીય સુવિધાઓ અને નાગરિક સહભાગિતા જ શહેરને સુરક્ષિત અને સમૃદ્ધ બનાવે છે.",
        "પારદર્શક નીતિઓ અને નાગરિક અધિકારોનું રક્ષણ એ જ સ્વસ્થ સમાજ નિર્માણનો સાચો માર્ગ છે.",
      ],
      targetType: "article",
      articleSlug: "urban-resilience-and-civic-accountability-in-coastal-cities",
    },
  ],
  2: [
    {
      id: "demo-p2-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 40,
      headlineText: "વ્યાપાર: એફપીઆઈ દ્વારા ₹૯૪,૨૫૦ કરોડનું રોકાણ અને એમએસએમઇ ક્રેડિટ સુધારા",
      summaryText:
        "ભારતીય મૂડીબજારમાં વિદેશી સંસ્થાકીય રોકાણકારોની સક્રિયતા અને એનએસઇની રોકાણકારો માટે મહત્વપૂર્ણ માર્ગદર્શિકા.",
      articleParagraphs: [
        "ભારતીય મૂડીબજારમાં વિદેશી સંસ્થાકીય રોકાણકારોએ વિશ્વાસ વ્યક્ત કરીને મોટા પાયે રોકાણ કર્યું છે, જેનાથી વ્યાપાર જગતમાં સકારાત્મક વાતાવરણ સર્જાયું છે.",
        "રિઝર્વ બેંક દ્વારા એમએસએમઇ નિકાસકારો માટે નવી ક્રેડિટ સેટલમેન્ટ વ્યવસ્થા લાગુ કરાતાં નાના ઉદ્યોગોને સીધો લાભ મળશે.",
        "એનએસઇ દ્વારા રોકાણકારોને સતર્ક રહેવા અને અધિકૃત માધ્યમો દ્વારા જ સોદા કરવાની સલાહ આપવામાં આવી છે.",
      ],
      targetType: "article",
      articleSlug: "rbi-msme-export-credit-settlement-framework",
    },
  ],
  3: [
    {
      id: "demo-p3-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 45,
      headlineText: "મુખ્ય સમાચાર: રાષ્ટ્રીય રાજકારણ, આર્થિક નીતિઓ અને આંતરરાષ્ટ્રીય ઘટનાક્રમ",
      summaryText:
        "દેશના મુખ્ય રાજકીય અને રાષ્ટ્રીય સમાચારો, સંસદીય મુદ્દાઓ અને વિદેશ નીતિ અંગે વિસ્તૃત અહેવાલ.",
      articleParagraphs: [
        "આજના મુખ્ય પાના પર દેશના અગ્રણી રાજકીય ઘટનાક્રમ, રાષ્ટ્રીય સુરક્ષા અને આર્થિક નીતિઓ અંગે મહત્વપૂર્ણ અહેવાલો પ્રકાશિત કરાયા છે.",
        "કેન્દ્ર અને રાજ્યો વચ્ચે વિકાસલક્ષી પ્રોજેક્ટ્સના સંકલન માટે નવી પહેલ હાથ ધરવામાં આવી છે.",
      ],
      targetType: "article",
      articleSlug: "western-india-maritime-freight-corridor-expansion-plan",
    },
  ],
  4: [
    {
      id: "demo-p4-h1",
      xPercent: 4,
      yPercent: 12,
      widthPercent: 92,
      heightPercent: 42,
      headlineText: "અગ્રલેખ અને કલમ-કિતાબ: મોંઘવારીનો પડકાર અને ડિજિટલ યુગમાં માતૃભાષાનું જતન",
      summaryText:
        "આર્થિક પડકારો, શિક્ષણમાં માતૃભાષાનું મહત્વ અને સામાજિક ચિંતન પર સંપાદકીય લેખો.",
      articleParagraphs: [
        "ડિજિટલ શિક્ષણના આધુનિક યુગમાં માતૃભાષાનું જતન અને ગુણવત્તાયુક્ત શિક્ષણ એ સમાજની પ્રાથમિક જરૂરિયાત છે.",
        "મોંઘવારી પર અંકુશ અને સામાન્ય નાગરિકોના જીવનધોરણમાં સુધારો એ આર્થિક નીતિનું કેન્દ્રબિંદુ હોવું જોઈએ.",
      ],
      targetType: "article",
      articleSlug: "preserving-mother-tongue-in-digital-education-era",
    },
  ],
  5: [
    {
      id: "demo-p5-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "દેશ-વિદેશ: કારકિર્દી માર્ગદર્શન, આંતરરાષ્ટ્રીય સુરક્ષા અને ગુજરાતમાં ઊર્જા-સીએનજી સમાચાર",
      summaryText:
        "વિદ્યાર્થીઓ માટે નવી કારકિર્દી તકો, વૈશ્વિક રાજકીય ઘટનાક્રમ અને ગુજરાતમાં ઊર્જા તેમજ સીએનજી દર અંગેના અહેવાલો.",
      articleParagraphs: [
        "આજના દેશ-વિદેશ પાના પર યુવાનો માટે કારકિર્દી માર્ગદર્શન અને નવા શૈક્ષણિક અભ્યાસક્રમો અંગે મહત્વપૂર્ણ માહિતી આપવામાં આવી છે.",
        "ગુજરાતમાં ઊર્જા અને સીએનજી પુરવઠા તેમજ આંતરરાષ્ટ્રીય સ્તરે બનતા મુખ્ય ઘટનાક્રમનો વિસ્તૃત અહેવાલ પ્રકાશિત થયો છે.",
      ],
      targetType: "article",
      articleSlug: "national-renewable-grid-storage-tender-announced",
    },
  ],
  6: [
    {
      id: "demo-p6-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "ફૂલછાબ-કચ્છમિત્ર સમાચાર: જલારામ જયંતી ઉજવણી અને કચ્છ ટુરિઝમ કોરિડોર વિકાસ",
      summaryText:
        "સૌરાષ્ટ્ર અને કચ્છમાં પૂજ્ય જલારામ બાપાની જયંતીની ભક્તિમય ઉજવણી, કચ્છ પ્રવાસન કોરિડોર અને મગફળી ખરીદીના અહેવાલો.",
      articleParagraphs: [
        "સૌરાષ્ટ્ર અને કચ્છના વિવિધ શહેરોમાં પૂજ્ય જલારામ બાપાની જયંતીની ધામધૂમથી ઉજવણી કરવામાં આવી હતી.",
        "કચ્છ ટુરિઝમ કોરિડોરના વિસ્તરણ અને સૌરાષ્ટ્રના માર્કેટિંગ યાર્ડોમાં મગફળીની રેકોર્ડ આવકથી ખેડૂતો અને વેપારીઓમાં ઉત્સાહ છે.",
      ],
      targetType: "article",
      articleSlug: "saurashtra-groundnut-procurement-centres-record-arrivals",
    },
  ],
  7: [
    {
      id: "demo-p7-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 46,
      heightPercent: 42,
      headlineText: "મહાનગર મુંબઈ: ફિલ્મ શૂટિંગ ટુરિઝમ અને શહેરી પરિવહન સુવિધાઓનો વિસ્તાર",
      summaryText:
        "મુંબઈમાં પ્રવાસન, મેટ્રો કનેક્ટિવિટી અને નાગરિક સુરક્ષા માટે મહાનગરપાલિકા અને રાજ્ય સરકારની નવી પહેલ.",
      articleParagraphs: [
        "મુંબઈ મહાનગરમાં ફિલ્મ શૂટિંગ ટુરિઝમને પ્રોત્સાહન આપવા અને નાગરિક પરિવહન વધુ સુગમ બનાવવા નવી યોજનાઓ અમલમાં મૂકાઈ છે.",
        "મુંબઈ ભાડા કાયદા અને મહિલા સુરક્ષા અંગે મહત્વપૂર્ણ નિર્ણયો લેવાયા છે.",
      ],
      targetType: "article",
      articleSlug: "mumbai-coastal-metro-interchange-commuter-review",
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
      articleSlug: "ahmedabad-mumbai-high-speed-corridor-station-concourse-update",
    },
  ],
  8: [
    {
      id: "demo-p8-h1",
      xPercent: 4,
      yPercent: 28,
      widthPercent: 44,
      heightPercent: 36,
      headlineText: "વૈવિધ્ય અને શ્રદ્ધાંજલિ: રાશિભવિષ્ય, શબ્દવ્યૂહ અને સામાજિક બેસણાં નોંધ",
      summaryText:
        "આજનું રાશિભવિષ્ય, સુડોકુ, ક્રોસવર્ડ અને મુંબઈ-ગુજરાત સમાજના શ્રદ્ધાંજલિ તેમજ બેસણાં સમાચાર.",
      articleParagraphs: [
        "આજના વૈવિધ્ય પાના પર દૈનિક રાશિભવિષ્ય, શબ્દવ્યૂહ, સુડોકુ અને સાંસ્કૃતિક વાંચન સામગ્રી પ્રસ્તુત છે.",
        "સામાજિક અને વ્યાપારી જગતના અગ્રણીઓને શ્રદ્ધાંજલિ તેમજ પરિવારજનોની પ્રાર્થના સભાની વિગતો પ્રકાશિત કરાઈ છે.",
      ],
      targetType: "article",
      articleSlug: "community-obituary-and-besanu-notices-sample",
    },
    {
      id: "demo-p8-h2",
      xPercent: 50,
      yPercent: 28,
      widthPercent: 46,
      heightPercent: 36,
      headlineText: "સાંસ્કૃતિક વારસો: ગુજરાતી નાટક અને સુગમ સંગીત મહોત્સવની જાહેરાત",
      summaryText:
        "મુંબઈમાં ગુજરાતી રંગભૂમિ અને શાસ્ત્રીય સુગમ સંગીતના વિશેષ કાર્યક્રમોનું આયોજન.",
      articleParagraphs: [
        "મુંબઈમાં ગુજરાતી નાટકના શતાબ્દી પ્રદર્શન અને સુગમ સંગીત મહોત્સવને લઈને કલાપ્રેમીઓમાં ભારે ઉત્સાહ છે.",
        "વિવિધ સાંસ્કૃતિક સંસ્થાઓ દ્વારા યુવા કલાકારોને મંચ પૂરું પાડવા વિશેષ આયોજન કરાયું છે.",
      ],
      targetType: "article",
      articleSlug: "gujarati-natak-centenary-archival-exhibition-mumbai",
    },
  ],
  9: [
    {
      id: "demo-p9-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "વ્યાપાર-બજાર: બજેટ ૨૦૨૭માં મ્યુચ્યુઅલ ફંડ LTCG અને સિનિયર લિવિંગ ક્ષેત્રે રોકાણની તકો",
      summaryText:
        "મ્યુચ્યુઅલ ફંડ રોકાણકારો માટે કરવેરાના નિયમો, રિયલ એસ્ટેટ અને સિનિયર લિવિંગ પ્રોજેક્ટ્સ અંગે વિશેષ વિશ્લેષણ.",
      articleParagraphs: [
        "આગામી બજેટમાં મ્યુચ્યુઅલ ફંડના લોંગ ટર્મ કેપિટલ ગેઇન (LTCG) ટેક્સ અંગે રોકાણકારોની અપેક્ષાઓ અને નાણાકીય આયોજન અંગે નિષ્ણાતોના મંતવ્યો રજૂ કરાયા છે.",
        "ભારતમાં સિનિયર લિવિંગ અને ગિફ્ટ સિટી ફિનટેક ક્ષેત્રે વધી રહેલા રોકાણના અવસરોનો વિશેષ અહેવાલ પ્રકાશિત થયો છે.",
      ],
      targetType: "article",
      articleSlug: "gift-city-fintech-regulatory-sandbox-cohort",
    },
  ],
  10: [
    {
      id: "demo-p10-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "વ્યાપાર-અર્થતંત્ર: એગ્રી બાયોટેક, નિકાસ વૃદ્ધિ અને NRI TDS નિયમો અંગે માર્ગદર્શન",
      summaryText:
        "કૃષિ બાયોટેકનોલોજી ક્ષેત્રે નવીનતા, સહકારી બેંકિંગ સુધારા અને એનઆરઆઈ રોકાણકારો માટે ટીડીએસ માર્ગદર્શિકા.",
      articleParagraphs: [
        "દેશમાં એગ્રી બાયોટેક અને આધુનિક ખેતી આધારિત ઉદ્યોગોમાં નિકાસની મોટી સંભાવનાઓ ઉભી થઈ છે.",
        "એનઆરઆઈ રોકાણકારો માટે ટીડીએસ (TDS) અને મિલકત વેચાણ સંબંધિત કરવેરા નિયમોની સરળ સમજૂતી આજના વ્યાપાર પાના પર આપવામાં આવી છે.",
      ],
      targetType: "article",
      articleSlug: "rbi-msme-export-credit-settlement-framework",
    },
  ],
  11: [
    {
      id: "demo-p11-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "રમતગમત: ભારતે ૫મી વન-ડેમાં ન્યુઝીલેન્ડને ૨૨ રને હરાવ્યું; લક્ષ્ય સેને જાપાન માસ્ટર્સ જીત્યું",
      summaryText:
        "ક્રિકેટ અને બેડમિન્ટનમાં ભારતીય ખેલાડીઓનું શાનદાર પ્રદર્શન, રણજી ટ્રોફીમાં મુંબઈ-સૌરાષ્ટ્ર મુકાબલાની તૈયારી.",
      articleParagraphs: [
        "ભારતીય ક્રિકેટ ટીમે પાંચમી વન-ડે મેચમાં શાનદાર પ્રદર્શન કરીને ન્યુઝીલેન્ડ સામે ૨૨ રને વિજય મેળવ્યો છે.",
        "બેડમિન્ટનમાં ભારતના સ્ટાર ખેલાડી લક્ષ્ય સેને જાપાન માસ્ટર્સ ટાઇટલ જીતીને દેશનું ગૌરવ વધાર્યું છે.",
      ],
      targetType: "article",
      articleSlug: "ranji-trophy-mumbai-saurashtra-clash-preview",
    },
  ],
  12: [
    {
      id: "demo-p12-h1",
      xPercent: 4,
      yPercent: 10,
      widthPercent: 92,
      heightPercent: 44,
      headlineText: "છેલ્લું પાનું: મુંબઈના ૮ લાખ ઘરો માટે જળ પુરવઠાનું આયોજન અને છઠ પૂજા ઉજવણી",
      summaryText:
        "મુંબઈમાં પીવાના પાણીની વ્યવસ્થા, મહાબળેશ્વરમાં ખાદ્ય સુરક્ષા તપાસ અને રાજ્યના મહત્વપૂર્ણ સમાચારો.",
      articleParagraphs: [
        "મુંબઈ મહાનગરના ૮ લાખથી વધુ ઘરોને નિયમિત અને શુદ્ધ પાણી પુરવઠો પૂરો પાડવા માટે વિશેષ માળખાકીય આયોજન હાથ ધરાયું છે.",
        "શહેરમાં છઠ પૂજાની ભવ્ય ઉજવણી અને પ્રવાસન સ્થળોએ ખાદ્ય સુરક્ષા અંગે વિશેષ ઝુંબેશ ચલાવવામાં આવી છે.",
      ],
      targetType: "article",
      articleSlug: "mumbai-coastal-metro-interchange-commuter-review",
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

  // Catalog / Edition state — defaults strictly to today's local date
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [selectedPubId, setSelectedPubId] = useState<string>(initialPublicationId);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(() => getTodayDateStr());
  const [editionsList, setEditionsList] = useState<EditionSummaryItem[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [editionDetail, setEditionDetail] = useState<PublicEditionDetail | null>(null);

  // Reader state
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [fitMode, setFitMode] = useState<"fit-page" | "fit-width">("fit-page");
  const [showThumbRail, setShowThumbRail] = useState<boolean>(true);
  const [isSpreadView, setIsSpreadView] = useState<boolean>(false);
  const [filmstripOpen, setFilmstripOpen] = useState<boolean>(false);
  const [savedClipsDrawerOpen, setSavedClipsDrawerOpen] = useState<boolean>(false);
  const [pageArticlesDrawerOpen, setPageArticlesDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drag-to-pan & Interactive Clip-to-Read (No Share) state
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const primaryImgRef = useRef<HTMLImageElement | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const [isClipMode, setIsClipMode] = useState<boolean>(false);
  const [clipDraft, setClipDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const clipStartRef = useRef<{ x: number; y: number } | null>(null);
  const [croppedClipPreview, setCroppedClipPreview] = useState<{
    imageDataUrl: string;
    pageNumber: number;
    label: string;
  } | null>(null);

  // Article reading modal state
  const [selectedHotspot, setSelectedHotspot] = useState<PublicHotspot | null>(null);
  const [modalLang, setModalLang] = useState<"gu" | "en">(isGu ? "gu" : "en");
  const [autoEnCache, setAutoEnCache] = useState<
    Record<string, { headlineEn: string; subHeadlineEn: string; bodyTextEn: string }>
  >({});
  const [isTranslatingModal, setIsTranslatingModal] = useState<boolean>(false);
  const [readingTheme, setReadingTheme] = useState<"white" | "sepia" | "dark">("white");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [ttsSpeed, setTtsSpeed] = useState<0.9 | 1 | 1.25>(1);
  const [savedClips, setSavedClips] = useState<SavedClipItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscriber authentication
  const { isAuthenticated, activeSubscriptions, openAuthModal, token } = useSubscriberAuth();
  const hasActiveAccess = isAuthenticated && activeSubscriptions.length > 0;

  // Helper to append subscriber/guest auth token to protected page image requests
  const getPageImageUrl = (pageId: string) => {
    if (pageId.startsWith("page-pub-")) {
      const match = pageId.match(/^page-(pub-[a-z-]+)-(\d+)$/);
      const pub = match?.[1] || editionDetail?.publicationId || "pub-janmabhoomi";
      const page = match?.[2] || "1";
      if (pub === "pub-janmabhoomi") {
        return `/assets/epaper/jb-2026-11-16/page-${page}.jpg`;
      }
      return `/api/v1/epaper/preview-sheet?pub=${encodeURIComponent(pub)}&page=${page}`;
    }
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
    if (pageId.startsWith("page-pub-")) {
      return getPageImageUrl(pageId);
    }
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
        if (data.success && Array.isArray(data.editions)) {
          const allowedEditions = data.editions.filter((e: EditionSummaryItem) =>
            ALLOWED_EPAPER_PUB_IDS.has(e.publicationId)
          );
          if (allowedEditions.length > 0) {
            // If viewing "all", ensure all 3 Janmabhoomi editions are represented
            if (pubId === "all") {
              const defaults = generateDefaultEditions();
              const existingPubIds = new Set(allowedEditions.map((e: EditionSummaryItem) => e.publicationId));
              const merged = [
                ...allowedEditions,
                ...defaults.filter((d) => !existingPubIds.has(d.publicationId)),
              ];
              setEditionsList(merged);
              return;
            }
            setEditionsList(allowedEditions);
            return;
          }
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
      const isJanmabhoomiPdf = matchingPub.id === "pub-janmabhoomi";
      const pageCount = matchingPub.id === "pub-purti" || matchingPub.id === "pub-madhuvan" ? 8 : 12;

      const pages: PublicPageItem[] = Array.from({ length: pageCount }, (_, i) => ({
        id: `page-${matchingPub.id}-${i + 1}`,
        pageNumber: i + 1,
        labelGu: isJanmabhoomiPdf
          ? JB_2026_11_16_PAGE_LABELS[i]?.gu || `પાનું ${i + 1}`
          : `પાનું ${i + 1}`,
        labelEn: isJanmabhoomiPdf
          ? JB_2026_11_16_PAGE_LABELS[i]?.en || `Page ${i + 1}`
          : `Page ${i + 1}`,
        widthPx: isJanmabhoomiPdf ? 1767 : 1200,
        heightPx: isJanmabhoomiPdf ? 2736 : 1800,
        isFreePreview: isJanmabhoomiPdf ? true : i === 0,
        imageThumbnailKey: isJanmabhoomiPdf
          ? `/assets/epaper/jb-2026-11-16/page-${i + 1}.jpg`
          : `/assets/images/epaper-placeholder.jpg`,
        hotspots: DEFAULT_PAGE_HOTSPOTS[i + 1] || [],
      }));

      const syntheticDetail: PublicEditionDetail = {
        id: editionId,
        publicationId: matchingPub.id,
        editionDate: isJanmabhoomiPdf ? "2026-11-16" : new Date().toISOString().split("T")[0],
        editionCity: matchingPub.city,
        editionNameEn: isJanmabhoomiPdf
          ? "Janmabhoomi Mumbai — 16 Nov 2026"
          : `${matchingPub.nameEn} Digital Broadsheet`,
        editionNameGu: isJanmabhoomiPdf
          ? "જન્મભૂમિ મુંબઈ — ૧૬ નવેમ્બર ૨૦૨૬"
          : `${matchingPub.nameGu} ડિજિટલ અખબાર`,
        totalPageCount: pageCount,
        freePreviewPageLimit: isJanmabhoomiPdf ? pageCount : 1,
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

  const handleToggleSpeak = (textToRead: string, customRate?: 0.9 | 1 | 1.25) => {
    if (isSpeaking && !customRate) {
      stopSpeaking();
      return;
    }

    haltSpeaking();
    const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(textToRead);

    const started = speakText(textToRead, {
      lang: hasGujaratiScript ? "gu" : modalLang,
      rate: customRate || ttsSpeed,
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

  // Zoom helpers (Smooth steps 100% -> 125% -> 150% -> 200% -> 250%)
  const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5];
  const handleZoomIn = () => {
    setZoomScale((z) => ZOOM_STEPS.find((s) => s > z + 0.01) ?? 2.5);
  };
  const handleZoomOut = () => {
    setZoomScale((z) => [...ZOOM_STEPS].reverse().find((s) => s < z - 0.01) ?? 1);
  };

  // Drag-to-pan handlers when zoomed in
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClipMode || zoomScale <= 1 || !canvasScrollRef.current) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasScrollRef.current.scrollLeft,
      scrollTop: canvasScrollRef.current.scrollTop,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current || !canvasScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    canvasScrollRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    canvasScrollRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Interactive Clip-to-Read (Pointer-captured so dragging past edge never breaks; CORS-safe fallback; NO share button)
  const handleSheetClipStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isClipMode) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    clipStartRef.current = { x: xPct, y: yPct };
    setClipDraft({ x: xPct, y: yPct, w: 0, h: 0 });
  };

  const handleSheetClipMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isClipMode || !clipStartRef.current) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const x = Math.min(clipStartRef.current.x, curX);
    const y = Math.min(clipStartRef.current.y, curY);
    const w = Math.abs(curX - clipStartRef.current.x);
    const h = Math.abs(curY - clipStartRef.current.y);
    setClipDraft({ x, y, w, h });
  };

  const handleSheetClipEnd = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isClipMode || !clipDraft || !clipStartRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const finalDraft = { ...clipDraft };
    clipStartRef.current = null;
    setClipDraft(null);

    if (finalDraft.w < 2 || finalDraft.h < 2) {
      triggerToast(
        isGu
          ? "ક્લિપ કરવા માટે લેખ પર માઉસ ખેંચીને બોક્સ બનાવો"
          : "Drag a larger box over the article to clip it"
      );
      return;
    }

    const img = primaryImgRef.current;
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) {
      triggerToast(isGu ? "પાનું હજુ લોડ થઈ રહ્યું છે" : "Page image is still loading");
      setIsClipMode(false);
      return;
    }

    const sx = Math.round((finalDraft.x / 100) * img.naturalWidth);
    const sy = Math.round((finalDraft.y / 100) * img.naturalHeight);
    const sw = Math.max(24, Math.round((finalDraft.w / 100) * img.naturalWidth));
    const sh = Math.max(24, Math.round((finalDraft.h / 100) * img.naturalHeight));

    // Scale output cleanly to max 960px wide so preview is crisp & localStorage-friendly
    const maxOutW = 960;
    const scale = sw > maxOutW ? maxOutW / sw : 1;
    const outW = Math.max(24, Math.round(sw * scale));
    const outH = Math.max(24, Math.round(sh * scale));

    let dataUrl: string | null = null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      }
    } catch {
      // Fallback: fetch same-origin image as Blob -> ImageBitmap -> Canvas
      try {
        const res = await fetch(img.currentSrc || img.src);
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
          dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        }
        bitmap.close();
      } catch {
        dataUrl = null;
      }
    }

    if (dataUrl) {
      setCroppedClipPreview({
        imageDataUrl: dataUrl,
        pageNumber: activePageNum,
        label: isGu
          ? `${currentPub.nameGu} — પાનું ${activePageNum} ક્લિપિંગ`
          : `${currentPub.nameEn} — Page ${activePageNum} Clipping`,
      });
    } else {
      triggerToast(
        isGu
          ? "આ પાના પર ક્લિપિંગ તૈયાર કરવામાં મુશ્કેલી આવી"
          : "Could not generate image crop for this page"
      );
    }
    setIsClipMode(false);
  };

  const handleSaveCroppedClip = () => {
    if (!croppedClipPreview) return;
    const newClip: SavedClipItem = {
      id: `crop-${Date.now()}`,
      headlineText: croppedClipPreview.label,
      summaryText: `${displayDate} • ${currentPub.nameEn}`,
      pageNumber: croppedClipPreview.pageNumber,
      savedAt: new Date().toLocaleDateString(isGu ? "gu-IN" : "en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      croppedImageDataUrl: croppedClipPreview.imageDataUrl,
    };
    const updated = [newClip, ...savedClips];
    setSavedClips(updated);
    try {
      localStorage.setItem("janmabhoomi_saved_clips_v2", JSON.stringify(updated));
    } catch {
      // If storage is full, keep the 8 most recent clips and retry
      try {
        const trimmed = updated.slice(0, 8);
        setSavedClips(trimmed);
        localStorage.setItem("janmabhoomi_saved_clips_v2", JSON.stringify(trimmed));
      } catch {}
    }
    setCroppedClipPreview(null);
    setSavedClipsDrawerOpen(true);
    triggerToast(
      isGu ? "📌 ક્લિપિંગ તમારા સેવ્ડ ક્લિપ્સમાં સેવ થયું" : "📌 Clipping saved to My Saved Clips"
    );
  };

  useEffect(() => {
    if (!selectedHotspot) {
      stopSpeaking();
      return;
    }
    const preferred: "gu" | "en" = isGu ? "gu" : "en";
    setModalLang(preferred);

    // If user is on /en/epaper and hotspot doesn't have saved English text yet, auto-translate seamlessly
    if (
      preferred === "en" &&
      !selectedHotspot.headlineEn &&
      !selectedHotspot.bodyTextEn &&
      !autoEnCache[selectedHotspot.id]
    ) {
      const bodyGu =
        selectedHotspot.bodyText ||
        (selectedHotspot.articleParagraphs?.join("\n\n") ?? selectedHotspot.summaryText ?? "");
      if (selectedHotspot.headlineText || bodyGu) {
        setIsTranslatingModal(true);
        fetch("/api/v1/epaper/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headlineGu: selectedHotspot.headlineText || "",
            subHeadlineGu: selectedHotspot.subHeadlineText || "",
            bodyTextGu: bodyGu,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) {
              setAutoEnCache((prev) => ({
                ...prev,
                [selectedHotspot.id]: {
                  headlineEn: data.headlineEn || "",
                  subHeadlineEn: data.subHeadlineEn || "",
                  bodyTextEn: data.bodyTextEn || "",
                },
              }));
            }
          })
          .catch(() => {})
          .finally(() => setIsTranslatingModal(false));
      }
    }
  }, [selectedHotspot, isGu]);

  const handleSwitchModalLang = async (target: "gu" | "en") => {
    stopSpeaking();
    setModalLang(target);
    if (
      target === "en" &&
      selectedHotspot &&
      !selectedHotspot.headlineEn &&
      !selectedHotspot.bodyTextEn &&
      !autoEnCache[selectedHotspot.id]
    ) {
      const bodyGu =
        selectedHotspot.bodyText ||
        (selectedHotspot.articleParagraphs?.join("\n\n") ?? selectedHotspot.summaryText ?? "");
      if (selectedHotspot.headlineText || bodyGu) {
        setIsTranslatingModal(true);
        try {
          const res = await fetch("/api/v1/epaper/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              headlineGu: selectedHotspot.headlineText || "",
              subHeadlineGu: selectedHotspot.subHeadlineText || "",
              bodyTextGu: bodyGu,
            }),
          });
          const data = await res.json();
          if (data?.success) {
            setAutoEnCache((prev) => ({
              ...prev,
              [selectedHotspot.id]: {
                headlineEn: data.headlineEn || "",
                subHeadlineEn: data.subHeadlineEn || "",
                bodyTextEn: data.bodyTextEn || "",
              },
            }));
          }
        } catch {}
        setIsTranslatingModal(false);
      }
    }
  };

  // Ensure TTS playback stops cleanly when navigating away from the E-Paper reader
  useEffect(() => {
    return () => {
      haltSpeaking();
    };
  }, []);

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

  const todayDateStr = getTodayDateStr();
  const activeDateFilter = selectedDateFilter || todayDateStr;
  const pubMatchedEditions = editionsList.filter(
    (ed) => selectedPubId === "all" || ed.publicationId === selectedPubId
  );
  const filteredEditions = pubMatchedEditions.filter((ed) => {
    const edDateOnly = ed.editionDate ? ed.editionDate.split("T")[0] : "";
    return edDateOnly === activeDateFilter;
  });
  const latestAvailableDate =
    pubMatchedEditions
      .map((e) => (e.editionDate ? e.editionDate.split("T")[0] : ""))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))[0] || "";

  const formatDdMmYyyy = (isoDate: string) => {
    const parts = isoDate.split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return isoDate;
  };
  const activeDateDisplay = formatDdMmYyyy(activeDateFilter);
  const latestAvailableDisplay = latestAvailableDate ? formatDdMmYyyy(latestAvailableDate) : "";

  // Guard against garbled legacy DTP font mojibake (Shree-Guj / Terafont mapped onto Latin-1)
  const isGarbledLegacyText = (txt?: string) => {
    if (!txt) return false;
    return /[\u0080-\u00FF\u0152\u0153\u0160\u0161]|&&|`|blpfNpdfu|frhhpf/.test(txt);
  };

  // Only use static demo hotspots on synthetic fallback editions;
  // NEVER overlay unrelated demo articles or garbled legacy font text onto real uploaded PDF editions!
  const isSyntheticDemoEdition = Boolean(editionDetail?.id?.startsWith("edition-pub-"));
  const rawPageHotspots = (activePage?.hotspots || []).filter(
    (h) => !isGarbledLegacyText(h.headlineText)
  );
  const currentHotspots: PublicHotspot[] =
    rawPageHotspots.length > 0
      ? rawPageHotspots
      : isSyntheticDemoEdition
      ? DEFAULT_PAGE_HOTSPOTS[activePageNum] || getFallbackHotspotsForPage(activePageNum)
      : [];

  // =========================================================================
  // VIEW 1: CATALOG OF ALL E-PAPERS
  // =========================================================================
  if (!selectedEditionId) {
    return (
      <div className="space-y-6">
        <SponsorStrip slotKey="epaper_sponsor" lang={lang} />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7]/10 text-[#016BB7] px-3 py-1 text-xs font-bold border border-[#016BB7]/20">
                  <Newspaper className="h-3.5 w-3.5" />
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

              {/* Calendar Date Filter (Browse E-Paper by Any Date) */}
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
                <input
                  type="date"
                  value={activeDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value || getTodayDateStr())}
                  aria-label={isGu ? "તારીખ પસંદ કરો" : "Filter E-Paper by date"}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                />
                {activeDateFilter !== todayDateStr && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter(todayDateStr)}
                    className="ml-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 p-0.5 cursor-pointer"
                    title={isGu ? "આજની તારીખ પર પાછા જાઓ" : "Back to today's date"}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
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
              {isGu
                ? `${activeDateDisplay} તારીખનું ઇ-પેપર ઉપલબ્ધ નથી`
                : `No E-Paper available for ${activeDateDisplay}`}
            </h3>
            <p className="text-xs text-slate-500">
              {isGu
                ? "અન્ય દિવસનું ઇ-પેપર વાંચવા માટે ઉપરના કેલેન્ડરમાંથી તારીખ પસંદ કરો."
                : "Use the date picker above to select another day's E-Paper edition."}
            </p>
            {latestAvailableDate && latestAvailableDate !== activeDateFilter && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter(latestAvailableDate)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#016BB7] hover:bg-[#004E89] text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {isGu
                      ? `તાજેતરનું ઉપલબ્ધ ઇ-પેપર જુઓ (${latestAvailableDisplay})`
                      : `View Latest Available Edition (${latestAvailableDisplay})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        src={
                          ed.coverImageUrl && ed.coverImageUrl.startsWith("/assets/epaper/")
                            ? ed.coverImageUrl
                            : ed.id.startsWith("edition-pub-")
                            ? `/api/v1/epaper/preview-sheet?pub=${encodeURIComponent(ed.publicationId)}&page=1`
                            : `/api/v1/epaper/editions/${ed.id}/cover`
                        }
                        alt={ed.editionNameGu || pub.nameGu}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            `/api/v1/epaper/preview-sheet?pub=${encodeURIComponent(ed.publicationId)}&page=1`;
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

        {/* Right: Date Switcher + Page Articles + Saved Clips + Section Jump + Preview Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Archive Date / Edition Switcher for Same Publication */}
          {editionsList.filter((e) => e.publicationId === editionDetail?.publicationId).length > 1 && (
            <select
              value={selectedEditionId || ""}
              onChange={(e) => {
                if (e.target.value) {
                  stopSpeaking();
                  setSelectedEditionId(e.target.value);
                  setActivePageNum(1);
                  setZoomScale(1);
                  setIsClipMode(false);
                }
              }}
              className="bg-white/10 text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-white/15 hover:bg-white/15 transition-colors cursor-pointer focus:outline-none"
              title={isGu ? "અન્ય તારીખની આવૃત્તિ પસંદ કરો" : "Switch Edition Date"}
            >
              {editionsList
                .filter((e) => e.publicationId === editionDetail?.publicationId)
                .map((ed) => (
                  <option key={ed.id} value={ed.id} className="bg-slate-900 text-white">
                    {ed.editionDate?.split("T")[0] || ed.editionNameEn}
                  </option>
                ))}
            </select>
          )}

          {/* Page Articles List Drawer Trigger (Shows real articles on this page) */}
          {currentHotspots.length > 0 && (
            <button
              type="button"
              onClick={() => setPageArticlesDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold transition-colors cursor-pointer border border-emerald-400/30"
              title={isGu ? "આ પાનાના લેખો" : "Articles on This Page"}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isGu ? "પાનાના લેખો" : "Page Articles"}
              </span>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full px-1.5">
                {currentHotspots.length}
              </span>
            </button>
          )}

          {/* Prominent Clip Article Button in Top Reader Bar */}
          <button
            type="button"
            onClick={() => {
              if (isSpreadView) setIsSpreadView(false);
              setIsClipMode((prev) => !prev);
              setClipDraft(null);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              isClipMode
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-white/10 hover:bg-white/20 text-white border-white/15"
            }`}
            title={isGu ? "કોઈપણ લેખ કાપીને સેવ કરો" : "Clip & Save Any Article"}
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>{isGu ? "ક્લિપ કરો" : "Clip Article"}</span>
          </button>

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

      {/* 1B. E-PAPER READER TOP SPONSOR STRIP (Visible across all 12 broadsheet pages) */}
      <div className="bg-[#14171c] border-b border-white/10 px-4 py-2 z-20">
        <SponsorStrip slotKey="epaper_sponsor" lang={lang} theme="dark" compact />
      </div>

      {/* 2. MAIN READER BODY: COLLAPSIBLE LEFT THUMBNAIL RAIL + WARM SLATE CANVAS */}
      <div className="flex flex-1 min-h-[720px] max-h-[88vh] bg-[#181a1e] overflow-hidden">
        {/* Collapsible Left Page Thumbnail Rail (Desktop) */}
        {showThumbRail && pages.length > 1 && (
          <aside className="hidden lg:flex flex-col w-28 shrink-0 bg-[#121418] border-r border-white/10 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-white/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center pb-1 border-b border-white/10">
              {isGu ? `પાના (${totalPages})` : `Pages (${totalPages})`}
            </div>
            {pages.map((p) => {
              const isCurrent = p.pageNumber === activePageNum;
              const isLocked = p.pageNumber > freeLimit && !hasActiveAccess && !p.isFreePreview;
              return (
                <button
                  key={`rail-${p.id}`}
                  type="button"
                  onClick={() => {
                    setActivePageNum(p.pageNumber);
                    setSelectedHotspot(null);
                    setZoomScale(1);
                    setIsClipMode(false);
                  }}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? "border-[#0190ee] ring-2 ring-[#0190ee]/40"
                      : "border-white/10 hover:border-white/35 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="aspect-[3/4] w-full bg-slate-800 relative">
                    <img
                      src={getPageThumbUrl(p.id)}
                      alt={`Page ${p.pageNumber}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`py-1 text-[10px] font-bold text-center ${
                      isCurrent ? "bg-[#016BB7] text-white" : "bg-slate-900 text-slate-300"
                    }`}
                  >
                    {isGu ? `પાનું ${p.pageNumber}` : `Page ${p.pageNumber}`}
                  </div>
                </button>
              );
            })}
          </aside>
        )}

        {/* MAIN BROADSHEET SCROLL / PAN CANVAS */}
        <div
          ref={canvasScrollRef}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
          className={`relative flex-1 bg-[#181a1e] p-4 sm:p-8 flex justify-center items-start overflow-auto select-none transition-all scrollbar-thin scrollbar-thumb-white/20 ${
            isClipMode
              ? "cursor-crosshair"
              : zoomScale > 1
              ? isPanning
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
        >
          {/* Clip Mode Active Banner */}
          {isClipMode && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-emerald-300/40 flex items-center gap-2">
              <Scissors className="h-3.5 w-3.5" />
              <span>
                {isGu
                  ? "ક્લિપ મોડ ચાલુ: કોઈપણ લેખ પર માઉસ ખેંચીને પસંદ કરો"
                  : "Clip Mode Active: Drag a box over any article to zoom & save"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsClipMode(false);
                  setClipDraft(null);
                }}
                className="ml-1 rounded-full bg-black/25 hover:bg-black/40 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
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
              className={`relative select-none bg-white rounded-xs overflow-hidden transition-all duration-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] ${
                isClipMode ? "cursor-crosshair" : ""
              }`}
              style={{
                transformOrigin: "top center",
                maxWidth: isSpreadView ? "50%" : "100%",
              }}
              onDoubleClick={() => {
                if (!isClipMode) setZoomScale((prev) => (prev > 1 ? 1 : 1.5));
              }}
              onPointerDown={handleSheetClipStart}
              onPointerMove={handleSheetClipMove}
              onPointerUp={handleSheetClipEnd}
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
                    primaryImgRef.current = img;
                    if (img && img.complete && img.naturalWidth > 0 && isImageLoading) {
                      setIsImageLoading(false);
                    }
                  }}
                  crossOrigin="anonymous"
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
                      : `${Math.round((fitMode === "fit-width" ? 1240 : isFullscreen ? 1140 : 940) * zoomScale)}px`,
                    maxWidth: zoomScale > 1 || fitMode === "fit-width" ? "none" : "100%",
                    height: "auto",
                  }}
                />
              )}

              {/* Active Clip Selection Box */}
              {isClipMode && clipDraft && clipDraft.w > 1 && clipDraft.h > 1 && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none z-30 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                  style={{
                    left: `${clipDraft.x}%`,
                    top: `${clipDraft.y}%`,
                    width: `${clipDraft.w}%`,
                    height: `${clipDraft.h}%`,
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

              {/* SMART HOTSPOT GLOWS (Hidden while Clip Mode is active) */}
              {!isImageLoading &&
                !isClipMode &&
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

                {/* Second Page Hotspots (Strict: never overlay fake demo articles on real uploaded PDFs) */}
                {(secondSpreadPage.hotspots && secondSpreadPage.hotspots.length > 0
                  ? secondSpreadPage.hotspots
                  : isSyntheticDemoEdition
                  ? DEFAULT_PAGE_HOTSPOTS[secondSpreadPage.pageNumber] ||
                    getFallbackHotspotsForPage(secondSpreadPage.pageNumber)
                  : []
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

                      {clip.croppedImageDataUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={clip.croppedImageDataUrl}
                            alt={clip.headlineText}
                            className="w-full max-h-40 object-contain"
                          />
                        </div>
                      )}

                      {clip.summaryText && (
                        <p className="text-xs text-slate-600 line-clamp-2 font-gujarati">
                          {clip.summaryText}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        {clip.articleSlug ? (
                          <Link
                            href={`/${lang}/article/${clip.articleSlug}`}
                            onClick={() => {
                              stopSpeaking();
                              setSavedClipsDrawerOpen(false);
                            }}
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

          {/* Left Thumbnail Rail Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => setShowThumbRail(!showThumbRail)}
            className={`hidden lg:inline-flex items-center p-1.5 rounded-full transition-colors cursor-pointer ${
              showThumbRail ? "bg-[#016BB7] text-white" : "hover:bg-white/15 text-slate-300"
            }`}
            title={isGu ? "ડાબી પાના પટ્ટી" : "Toggle Left Page Rail"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Spread View Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => {
              setIsSpreadView(!isSpreadView);
              setIsClipMode(false);
            }}
            className={`hidden md:inline-flex items-center gap-1 p-1.5 rounded-full transition-colors cursor-pointer ${
              isSpreadView ? "bg-[#016BB7] text-white" : "hover:bg-white/15 text-slate-300"
            }`}
            title={isSpreadView ? "Single Page View" : "Two-Page Spread View"}
          >
            {isSpreadView ? <Square className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
          </button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* Smooth Zoom Out / % Reset / Zoom In */}
          <button
            type="button"
            disabled={zoomScale <= 1}
            onClick={handleZoomOut}
            className="p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title={isGu ? "ઝૂમ ઓછું કરો (-)" : "Zoom Out (-)"}
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (zoomScale > 1) {
                setZoomScale(1);
              } else {
                setFitMode((m) => (m === "fit-page" ? "fit-width" : "fit-page"));
              }
            }}
            className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold tabular-nums text-white transition-colors cursor-pointer"
            title={
              zoomScale > 1
                ? isGu
                  ? "ઝૂમ રીસેટ (100%)"
                  : "Reset Zoom (100%)"
                : fitMode === "fit-page"
                ? isGu
                  ? "પહોળાઈ મુજબ ફિટ કરો"
                  : "Switch to Fit Width"
                : isGu
                ? "પાના મુજબ ફિટ કરો"
                : "Switch to Fit Page"
            }
          >
            {zoomScale > 1 ? `${Math.round(zoomScale * 100)}%` : fitMode === "fit-width" ? "Fit W" : "100%"}
          </button>

          <button
            type="button"
            disabled={zoomScale >= 2.5}
            onClick={handleZoomIn}
            className="p-1.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title={isGu ? "ઝૂમ વધારો (+)" : "Zoom In (+)"}
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Interactive Clip-to-Read Tool (NO Share option) */}
          {!isSpreadView && (
            <button
              type="button"
              onClick={() => {
                setIsClipMode(!isClipMode);
                setClipDraft(null);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                isClipMode
                  ? "bg-emerald-500 text-slate-950"
                  : "hover:bg-white/15 text-slate-200"
              }`}
              title={isGu ? "લેખ કાપીને ઝૂમમાં વાંચો / સેવ કરો" : "Clip Article to Read & Save"}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isGu ? "ક્લિપ" : "Clip"}</span>
            </button>
          )}

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
            className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border transition-colors ${
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
            {(() => {
              const cachedEn = autoEnCache[selectedHotspot.id];
              const useEn = modalLang === "en";
              const activeHeadline = useEn
                ? selectedHotspot.headlineEn ||
                  cachedEn?.headlineEn ||
                  selectedHotspot.headlineText ||
                  "News Article"
                : selectedHotspot.headlineText || (isGu ? "સમાચાર અહેવાલ" : "News Article");
              const activeSubHeadline = useEn
                ? selectedHotspot.subHeadlineEn || cachedEn?.subHeadlineEn || selectedHotspot.subHeadlineText
                : selectedHotspot.subHeadlineText;
              const activeBodyText = useEn
                ? selectedHotspot.bodyTextEn || cachedEn?.bodyTextEn || ""
                : selectedHotspot.bodyText || "";
              const activeParagraphs: string[] = useEn
                ? selectedHotspot.articleParagraphsEn && selectedHotspot.articleParagraphsEn.length > 0
                  ? selectedHotspot.articleParagraphsEn
                  : activeBodyText
                  ? activeBodyText.split(/\n+/).map((s) => s.trim()).filter(Boolean)
                  : []
                : selectedHotspot.articleParagraphs && selectedHotspot.articleParagraphs.length > 0
                ? selectedHotspot.articleParagraphs
                : activeBodyText
                ? activeBodyText.split(/\n+/).map((s) => s.trim()).filter(Boolean)
                : selectedHotspot.summaryText
                ? [selectedHotspot.summaryText]
                : [];

              const fullTextToSpeak = [
                activeHeadline,
                activeSubHeadline || "",
                ...activeParagraphs,
              ]
                .filter(Boolean)
                .join(". ");

              return (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/10 p-0.5 border border-black/10 dark:border-white/10 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => handleSwitchModalLang("gu")}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          modalLang === "gu"
                            ? "bg-[#016BB7] text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        ગુજરાતી
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchModalLang("en")}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          modalLang === "en"
                            ? "bg-[#016BB7] text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        English
                      </button>
                    </div>
                    {isTranslatingModal && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#016BB7]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Translating to English...</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black leading-snug font-gujarati">
                    {activeHeadline}
                  </h3>
                  {activeSubHeadline && (
                    <p className="text-sm sm:text-base font-semibold text-[#016BB7] leading-snug font-gujarati -mt-1.5">
                      {activeSubHeadline}
                    </p>
                  )}

                  {/* TTS Listen Mode Bar with Speed Controls (0.9x / 1x / 1.25x) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Volume2 className="h-4 w-4 text-[#016BB7]" />
                      <span>
                        {modalLang === "gu"
                          ? "ઓડિયો લિસન મોડ (ગુજરાતી)"
                          : "Audio Listen Mode (English)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Playback Speed Pills */}
                      <div className="inline-flex items-center rounded-lg bg-black/5 dark:bg-white/10 p-0.5 border border-black/10 dark:border-white/10">
                        {([0.9, 1, 1.25] as const).map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setTtsSpeed(rate);
                              if (isSpeaking) {
                                handleToggleSpeak(fullTextToSpeak, rate);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              ttsSpeed === rate
                                ? "bg-[#016BB7] text-white"
                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={isTranslatingModal}
                        onClick={() => handleToggleSpeak(fullTextToSpeak)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                          isSpeaking
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-[#016BB7] text-white hover:bg-[#015a99]"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <StopIcon className="h-3.5 w-3.5 fill-current" />
                            <span>{modalLang === "gu" ? "બંધ કરો" : "Stop"}</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>{modalLang === "gu" ? "સાંભળો" : "Listen"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reading Paragraphs (Scrollable for long articles) */}
                  <div
                    className={`p-4 rounded-xl border text-sm sm:text-base leading-relaxed font-gujarati space-y-3 overflow-y-auto max-h-[42vh] scrollbar-thin ${
                      readingTheme === "white"
                        ? "bg-slate-50/80 border-slate-200/80 text-slate-700"
                        : readingTheme === "sepia"
                        ? "bg-[#eee6d8] border-[#e2d5c3] text-[#3c2f21]"
                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    {activeParagraphs.length > 0 ? (
                      activeParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
                    ) : (
                      <p>
                        {modalLang === "gu"
                          ? "આ અહેવાલ આજની જન્મભૂમિ પ્રિન્ટ આવૃત્તિમાંથી પ્રસ્તુત કરવામાં આવ્યો છે."
                          : "This report is from today's Janmabhoomi broadsheet edition."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

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
                    onClick={() => stopSpeaking()}
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

      {/* 7. PAGE ARTICLES INDEX DRAWER (Lists ONLY real extracted/mapped articles on this page) */}
      {pageArticlesDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-[#016BB7]" />
                  <h3 className="text-base font-black text-slate-900 font-gujarati">
                    {isGu
                      ? `પાનું ${activePageNum} — લેખ સૂચિ`
                      : `Page ${activePageNum} — Articles`}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {currentHotspots.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPageArticlesDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1 scrollbar-thin">
                {currentHotspots.map((hotspot, idx) => (
                  <button
                    key={`page-article-${hotspot.id}`}
                    type="button"
                    onClick={() => {
                      setPageArticlesDrawerOpen(false);
                      setSelectedHotspot(hotspot);
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#016BB7] transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#016BB7]">
                      <span>{isGu ? `લેખ ${idx + 1}` : `Article ${idx + 1}`}</span>
                      <span className="inline-flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        <span>{isGu ? "વાંચો / સાંભળો" : "Read / Listen"}</span>
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 font-gujarati line-clamp-3">
                      {hotspot.headlineText || (isGu ? "સમાચાર અહેવાલ" : "News Article")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPageArticlesDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CROPPED ARTICLE CLIPPING READER MODAL (Save & Read Only — NO Share Button) */}
      {croppedClipPreview && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm select-none"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-[#016BB7]" />
                <h3 className="text-sm font-extrabold text-slate-900 font-gujarati">
                  {croppedClipPreview.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCroppedClipPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-auto bg-[#FAF8F3] flex justify-center">
              <img
                src={croppedClipPreview.imageDataUrl}
                alt={croppedClipPreview.label}
                className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 bg-white"
              />
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={handleSaveCroppedClip}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#016BB7] hover:bg-[#015696] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Bookmark className="h-4 w-4" />
                <span>{isGu ? "મારા સેવ્ડ ક્લિપ્સમાં સાચવો" : "Save to My Clips"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCroppedClipPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
