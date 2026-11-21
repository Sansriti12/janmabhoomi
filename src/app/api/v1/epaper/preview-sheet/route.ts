import { NextRequest, NextResponse } from "next/server";

const PUB_META: Record<
  string,
  {
    nameGu: string;
    nameEn: string;
    taglineGu: string;
    city: string;
    accent: string;
    pages: Array<{ labelGu: string; labelEn: string; leadGu: string; subGu: string; col2Gu: string }>;
  }
> = {
  "pub-janmabhoomi": {
    nameGu: "જન્મભૂમિ",
    nameEn: "JANMABHOOMI DAILY",
    taglineGu: "સમાચાર • વિશ્વાસ • નિષ્પક્ષતા • મુંબઈ આવૃત્તિ",
    city: "Mumbai",
    accent: "#016BB7",
    pages: [
      {
        labelGu: "પાનું ૧ • મુખ્ય પ્રથમ પાનું",
        labelEn: "Page 1 • Front Page",
        leadGu: "સેન્સેક્સ ૮૫,૦૦૦ ને પાર: ભારતીય શેરબજારમાં ઐતિહાસિક તેજીનો નવો દોર",
        subGu: "મુંબઈ મેટ્રોના નવા રૂટનું લોકાર્પણ: લાખો મુસાફરોની મુસાફરી સરળ બનશે",
        col2Gu: "વેસ્ટર્ન કોસ્ટલ રોડ અને પોર્ટ કનેક્ટિવિટીથી મહારાષ્ટ્ર-ગુજરાત વ્યાપારને નવી ગતિ",
      },
      {
        labelGu: "પાનું ૨ • શહેર અને મરણ નોંધ",
        labelEn: "Page 2 • City & Obituaries",
        leadGu: "મુંબઈ મહાનગરપાલિકા દ્વારા પાણી પુરવઠા અને માર્ગ સુધારણા માટે નવું પેકેજ",
        subGu: "ઘાટકોપર, બોરીવલી અને મુલુંડમાં સમુદાય બેસણું અને શ્રદ્ધાંજલિ નોંધ",
        col2Gu: "પશ્ચિમ રેલવેમાં ૧૫ કોચની વધુ લોકલ ટ્રેનો દોડાવવાનો નિર્ણય",
      },
      {
        labelGu: "પાનું ૩ • મહારાષ્ટ્ર અને મુંબઈ",
        labelEn: "Page 3 • Mumbai Metropolitan",
        leadGu: "નવી મુંબઈ આંતરરાષ્ટ્રીય એરપોર્ટ પર પ્રથમ કોમર્શિયલ ટ્રાયલ સફળ",
        subGu: "મુંબઈના ગુજરાતી રંગભૂમિ કલાકારોનું વિશેષ સન્માન સમારોહ",
        col2Gu: "દક્ષિણ મુંબઈથી બાંદ્રા સુધી નવા દરિયાઈ પ્રમોનેડનું લોકાર્પણ",
      },
      {
        labelGu: "પાનું ૪ • ગુજરાત અને સૌરાષ્ટ્ર",
        labelEn: "Page 4 • Gujarat & Saurashtra",
        leadGu: "રાજકોટ, ભાવનગર અને કચ્છમાં ઔદ્યોગિક કોરિડોર માટે નવા મૂડીરોકાણ",
        subGu: "ગાંધીનગરમાં રાજ્ય કેબિનેટની બેઠકમાં ખેડૂતો અને MSME માટે રાહત જાહેરાત",
        col2Gu: "સુરત ડાયમંડ બુર્સ અને ટેક્સટાઇલ પાર્કમાં નિકાસ ઓર્ડરમાં વધારો",
      },
    ],
  },
  "pub-pravasi": {
    nameGu: "જન્મભૂમિ પ્રવાસી",
    nameEn: "JANMABHOOMI PRAVASI",
    taglineGu: "સાપ્તાહિક રવિવારીય અખબાર • મુંબઈ અને વૈશ્વિક ગુજરાતી સમાજ",
    city: "Mumbai",
    accent: "#0B3558",
    pages: [
      {
        labelGu: "પાનું ૧ • રવિવારીય મુખ્ય પાનું",
        labelEn: "Page 1 • Sunday Front Page",
        leadGu: "વિશ્વભરમાં વસતા ગુજરાતી ઉદ્યોગસાહસિકોનું વતનના વિકાસમાં ઐતિહાસિક યોગદાન",
        subGu: "રવિવાર વિશેષ: મુંબઈ-ગુજરાત સાંસ્કૃતિક સેતુ અને આધુનિક શિક્ષણના નવા આયામો",
        col2Gu: "લંડન, ન્યૂયોર્ક અને દુબઈમાં ગુજરાતી સાહિત્ય અને ભાષા સંવર્ધન પરિષદ",
      },
      {
        labelGu: "પાનું ૨ • વિચાર અને વિમર્શ",
        labelEn: "Page 2 • Editorial & Essays",
        leadGu: "આધુનિક ડિજિટલ યુગમાં વિશ્વસનીય પત્રકારત્વ અને સમાજનું દાયિત્વ",
        subGu: "વરિષ્ઠ કટારલેખકોના વિચારપ્રેરક લેખો અને વાચકોના પત્રો",
        col2Gu: "સૌરાષ્ટ્ર ટ્રસ્ટની ૯૩ વર્ષની ગૌરવશાળી પત્રકારત્વ યાત્રા",
      },
      {
        labelGu: "પાનું ૩ • સાહિત્ય અને સંસ્કૃતિ",
        labelEn: "Page 3 • Literature & Culture",
        leadGu: "ગુજરાતી રંગભૂમિના સુવર્ણ દાયકાઓ અને નવી પેઢીના નાટ્યકારો",
        subGu: "મુંબઈ અને અમદાવાદમાં યોજાનાર પુસ્તક મેળાની વિશેષ ઝલક",
        col2Gu: "લોકસંગીત અને કાવ્ય સંમેલનમાં ઉમટેલા સાહિત્ય રસિકો",
      },
    ],
  },
  "pub-purti": {
    nameGu: "જન્મભૂમિ પૂર્તિ",
    nameEn: "JANMABHOOMI PURTI",
    taglineGu: "વિશેષ રંગીન સાપ્તાહિક પૂર્તિ • આરોગ્ય, સાહિત્ય અને જીવનશૈલી",
    city: "Mumbai",
    accent: "#9B2C2C",
    pages: [
      {
        labelGu: "પાનું ૧ • વિશેષ પૂર્તિ કવર",
        labelEn: "Page 1 • Supplement Cover",
        leadGu: "આરોગ્ય અને યોગ: વ્યસ્ત શહેરી જીવનમાં સ્વસ્થ રહેવાના સરળ ઉપાયો",
        subGu: "પરંપરાગત ગુજરાતી વાનગીઓ અને શિયાળુ પોષણ માર્ગદર્શિકા",
        col2Gu: "પ્રવાસ વિશેષ: કચ્છના સફેદ રણ અને સૌરાષ્ટ્રના ઐતિહાસિક તીર્થસ્થાનો",
      },
      {
        labelGu: "પાનું ૨ • કલા, સિનેમા અને પરિવાર",
        labelEn: "Page 2 • Arts, Cinema & Family",
        leadGu: "નવી ગુજરાતી ફિલ્મોએ રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય સ્તરે મેળવી પ્રશંસા",
        subGu: "બાળકોમાં વાંચનની ટેવ કેળવવા માટે માતા-પિતા માટે ઉપયોગી સૂચનો",
        col2Gu: "ઘર સજાવટ અને પર્યાવરણને અનુકૂળ જીવનશૈલીના નવા પ્રવાહો",
      },
    ],
  },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pubId = searchParams.get("pub") || "pub-janmabhoomi";
  const pageNum = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const dateStr = searchParams.get("date") || "21 November 2026";

  const meta = PUB_META[pubId] || PUB_META["pub-janmabhoomi"];
  const pageContent = meta.pages[(pageNum - 1) % meta.pages.length];

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1420" viewBox="0 0 1000 1420">
  <rect width="1000" height="1420" fill="#FCFBF7"/>
  <rect x="24" y="24" width="952" height="1372" fill="none" stroke="#1F2937" stroke-width="2"/>

  <!-- Top Masthead Bar -->
  <rect x="36" y="36" width="928" height="34" fill="${meta.accent}"/>
  <text x="54" y="58" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="700">${escapeXml(meta.nameEn)} • ${escapeXml(meta.city.toUpperCase())} EDITION</text>
  <text x="946" y="58" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="end">${escapeXml(dateStr)} • PAGE ${pageNum}</text>

  <!-- Main Newspaper Title -->
  <text x="500" y="138" fill="${meta.accent}" font-family="sans-serif" font-size="60" font-weight="900" text-anchor="middle">${escapeXml(meta.nameGu)}</text>
  <text x="500" y="168" fill="#374151" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle">${escapeXml(meta.taglineGu)}</text>

  <line x1="36" y1="186" x2="964" y2="186" stroke="#1F2937" stroke-width="3"/>
  <line x1="36" y1="192" x2="964" y2="192" stroke="#1F2937" stroke-width="1"/>

  <!-- Section Ribbon -->
  <rect x="36" y="206" width="320" height="28" rx="4" fill="#EBF4FB"/>
  <text x="48" y="225" fill="${meta.accent}" font-family="sans-serif" font-size="14" font-weight="800">${escapeXml(pageContent.labelGu)}</text>
  <text x="960" y="225" fill="#6B7280" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="end">${escapeXml(pageContent.labelEn)}</text>

  <!-- Lead Story Block (Left 2 Columns) -->
  <rect x="36" y="250" width="600" height="440" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>
  <rect x="52" y="266" width="568" height="220" fill="#E5EEF6" rx="4"/>
  <text x="336" y="382" fill="${meta.accent}" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">${escapeXml(meta.nameGu)} • ${escapeXml(meta.nameEn)}</text>
  <text x="336" y="410" fill="#4B5563" font-family="sans-serif" font-size="14" text-anchor="middle">Official Digital Broadsheet Replica — Page ${pageNum}</text>

  <text x="52" y="522" fill="#111827" font-family="sans-serif" font-size="22" font-weight="800">${escapeXml(pageContent.leadGu.slice(0, 44))}</text>
  <text x="52" y="552" fill="#111827" font-family="sans-serif" font-size="22" font-weight="800">${escapeXml(pageContent.leadGu.slice(44))}</text>
  <line x1="52" y1="570" x2="620" y2="570" stroke="#E5E7EB" stroke-width="1.5"/>

  <text x="52" y="598" fill="#374151" font-family="sans-serif" font-size="15">${escapeXml(pageContent.subGu.slice(0, 62))}</text>
  <text x="52" y="622" fill="#374151" font-family="sans-serif" font-size="15">${escapeXml(pageContent.subGu.slice(62))}</text>
  <text x="52" y="654" fill="#6B7280" font-family="sans-serif" font-size="13">જન્મભૂમિ બ્યુરો • મુંબઈ / ગુજરાત • સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન</text>

  <!-- Right Column Story Block -->
  <rect x="652" y="250" width="312" height="440" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>
  <rect x="652" y="250" width="312" height="32" fill="#1F2937"/>
  <text x="668" y="271" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="700">મુખ્ય સંક્ષિપ્ત સમાચાર • HIGHLIGHTS</text>
  <text x="668" y="316" fill="#111827" font-family="sans-serif" font-size="16" font-weight="800">${escapeXml(pageContent.col2Gu.slice(0, 32))}</text>
  <text x="668" y="340" fill="#111827" font-family="sans-serif" font-size="16" font-weight="800">${escapeXml(pageContent.col2Gu.slice(32, 64))}</text>
  <text x="668" y="364" fill="#111827" font-family="sans-serif" font-size="16" font-weight="800">${escapeXml(pageContent.col2Gu.slice(64))}</text>
  <line x1="668" y1="386" x2="948" y2="386" stroke="#E5E7EB" stroke-width="1"/>
  <rect x="668" y="404" width="280" height="12" rx="2" fill="#E5E7EB"/>
  <rect x="668" y="426" width="260" height="12" rx="2" fill="#E5E7EB"/>
  <rect x="668" y="448" width="272" height="12" rx="2" fill="#E5E7EB"/>
  <rect x="668" y="470" width="240" height="12" rx="2" fill="#E5E7EB"/>
  <line x1="668" y1="504" x2="948" y2="504" stroke="#E5E7EB" stroke-width="1"/>
  <rect x="668" y="524" width="280" height="140" rx="6" fill="#F0F6FA" stroke="#C5DDF0"/>
  <text x="808" y="586" fill="${meta.accent}" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન</text>
  <text x="808" y="612" fill="#4B5563" font-family="sans-serif" font-size="13" text-anchor="middle">Serving Readers Since 1934</text>

  <!-- Lower 3-Column Broadsheet Section -->
  <rect x="36" y="710" width="298" height="630" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>
  <rect x="351" y="710" width="298" height="630" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>
  <rect x="666" y="710" width="298" height="630" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1.5"/>

  <text x="52" y="746" fill="${meta.accent}" font-family="sans-serif" font-size="15" font-weight="800">મુંબઈ અને મહારાષ્ટ્ર</text>
  <line x1="52" y1="758" x2="318" y2="758" stroke="${meta.accent}" stroke-width="2"/>
  <rect x="52" y="778" width="266" height="14" rx="2" fill="#D1D5DB"/>
  <rect x="52" y="804" width="250" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="824" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="844" width="230" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="880" width="266" height="160" rx="4" fill="#F3F4F6"/>
  <rect x="52" y="1060" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="1080" width="254" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="1100" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="52" y="1120" width="220" height="10" rx="2" fill="#E5E7EB"/>

  <text x="367" y="746" fill="${meta.accent}" font-family="sans-serif" font-size="15" font-weight="800">ગુજરાત અને રાષ્ટ્રીય</text>
  <line x1="367" y1="758" x2="633" y2="758" stroke="${meta.accent}" stroke-width="2"/>
  <rect x="367" y="778" width="266" height="14" rx="2" fill="#D1D5DB"/>
  <rect x="367" y="804" width="260" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="824" width="246" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="844" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="880" width="266" height="160" rx="4" fill="#F3F4F6"/>
  <rect x="367" y="1060" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="1080" width="244" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="1100" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="367" y="1120" width="210" height="10" rx="2" fill="#E5E7EB"/>

  <text x="682" y="746" fill="${meta.accent}" font-family="sans-serif" font-size="15" font-weight="800">વ્યાપાર, રમતગમત અને કલા</text>
  <line x1="682" y1="758" x2="948" y2="758" stroke="${meta.accent}" stroke-width="2"/>
  <rect x="682" y="778" width="266" height="14" rx="2" fill="#D1D5DB"/>
  <rect x="682" y="804" width="256" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="824" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="844" width="236" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="880" width="266" height="160" rx="4" fill="#F3F4F6"/>
  <rect x="682" y="1060" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="1080" width="258" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="1100" width="266" height="10" rx="2" fill="#E5E7EB"/>
  <rect x="682" y="1120" width="225" height="10" rx="2" fill="#E5E7EB"/>

  <!-- Footer Line -->
  <line x1="36" y1="1362" x2="964" y2="1362" stroke="#1F2937" stroke-width="1.5"/>
  <text x="500" y="1384" fill="#4B5563" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle">© Saurashtra Trust • ${escapeXml(meta.nameEn)} • Page ${pageNum}</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
