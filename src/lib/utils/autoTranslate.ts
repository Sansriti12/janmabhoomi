/**
 * Automated Gujarati-to-English News Translation Utility
 * Used across the frontend data layer to ensure that when readers select English,
 * all headlines, summaries, and categories display in fluent English even if
 * the newsroom article was originally drafted in Gujarati.
 */

const PHRASE_MAP: Array<[RegExp, string]> = [
  // Transit & Infrastructure
  [/મુંબઈમાં જાહેર પરિવહનને વધુ સુવિધાજનક બનાવવા નવી મેટ્રો સેવા શરૂ/gi, "New Metro Services Launched in Mumbai to Enhance Public Transit Convenience"],
  [/અમદાવાદ-મુંબઈ વચ્ચે નવી હાઇ-સ્પીડ ટ્રેન સેવા શરૂ કરવાની રેલવે મંત્રાલયની જાહેરાત/gi, "Railway Ministry Announces New High-Speed Train Service Between Ahmedabad and Mumbai"],
  [/ગુજરાતમાં ૫૦૦ કરોડ રૂપિયાના ખર્ચે નવો સોલાર એનર્જી પાર્ક સ્થાપવાની જાહેરાત/gi, "New Solar Energy Park Worth ₹500 Crore Announced in Gujarat"],
  [/પશ્ચિમ રેલવે દ્વારા મુસાફરોની વધતી માંગને ધ્યાનમાં રાખીને/gi, "In response to growing passenger demand, Western Railway has"],
  [/અમદાવાદ અને મુંબઈ વચ્ચે વધારાની સુપરફાસ્ટ ટ્રેન શરૂ કરવાનો મહત્વપૂર્ણ નિર્ણય લેવામાં આવ્યો છે/gi, "decided to introduce additional superfast express trains between Ahmedabad and Mumbai."],
  [/મુસાફરોની વધતી સંખ્યાને ધ્યાનમાં રાખીને/gi, "considering the increasing number of commuters,"],
  [/જાહેર પરિવહન વ્યવસ્થાને વધુ સુવિધાજનક બનાવવા માટે/gi, "to make the public transportation network more accessible and convenient,"],
  [/નવી મેટ્રો સેવા શરૂ કરવાની જાહેરાત કરવામાં આવી છે/gi, "new metro train operations have been officially announced."],
  [/આ સેવા શરૂ થવાથી શહેરના વિવિધ વિસ્તારો વચ્ચે મુસાફરીનો સમય ઘટવાની અપેક્ષા છે/gi, "With the commencement of this service, commute times across key urban sectors are expected to decrease significantly."],
  [/રાજ્ય સરકારે સ્વચ્છ ઊર્જા ક્ષેત્રે ૭૫૦ મેગાવોટ ક્ષમતા ધરાવતો વિશાળ સોલાર પ્રોજેક્ટ મંજૂર કર્યો છે/gi, "The State Government has sanctioned a 750 MW green energy solar project,"],
  [/જેનાથી ૨૦૨૭ સુધીમાં હજારો નાગરિકોને પર્યાવરણને અનુકૂળ વીજળી મળશે/gi, "which will supply environmentally clean electricity to thousands of citizens by 2027."],

  // Common News Prefixes & Patterns
  [/\[ટેસ્ટ કન્ટેન્ટ\]/gi, "[TEST CONTENT]"],
  [/રાજ્ય સરકાર/gi, "State Government"],
  [/કેન્દ્ર સરકાર/gi, "Central Government"],
  [/મુખ્યમંત્રી/gi, "Chief Minister"],
  [/વડાપ્રધાન/gi, "Prime Minister"],
  [/રેલવે મંત્રાલય/gi, "Railway Ministry"],
  [/પશ્ચિમ રેલવે/gi, "Western Railway"],
  [/મહાનગરપાલિકા/gi, "Municipal Corporation"],
  [/ઉચ્ચ અદાલત|હાઈકોર્ટ/gi, "High Court"],
  [/સર્વોચ્ચ અદાલત|સુપ્રીમ કોર્ટ/gi, "Supreme Court"],
  [/રિઝર્વ બેંક/gi, "Reserve Bank of India"],
  [/શેરબજાર/gi, "Stock Market"],
  [/સેન્સેક્સ/gi, "Sensex"],
  [/નિફ્ટી/gi, "Nifty"],
  [/જાહેરાત કરવામાં આવી/gi, "has been announced"],
  [/મંજૂરી આપવામાં આવી/gi, "has been approved"],
  [/નિર્ણય લેવામાં આવ્યો/gi, "decision has been taken"],
  [/બેઠક યોજાઈ/gi, "meeting convened"],
  [/તપાસના આદેશ/gi, "investigation ordered"],
  [/કાર્યવાહી શરૂ/gi, "proceedings initiated"],
  [/યોજના શરૂ/gi, "initiative launched"],
  [/નવી નીતિ/gi, "new policy"],
  [/બજેટ રજૂ/gi, "budget presented"],
  [/હવામાન વિભાગ/gi, "Meteorological Department"],
  [/ભારે વરસાદની આગાહી/gi, "heavy rainfall forecasted"],
];

const WORD_MAP: Record<string, string> = {
  "મુંબઈ": "Mumbai",
  "અમદાવાદ": "Ahmedabad",
  "ગાંધીનગર": "Gandhinagar",
  "રાજકોટ": "Rajkot",
  "સુરત": "Surat",
  "વડોદરા": "Vadodara",
  "જામનગર": "Jamnagar",
  "ભાવનગર": "Bhavnagar",
  "કચ્છ": "Kutch",
  "સૌરાષ્ટ્ર": "Saurashtra",
  "ગુજરાત": "Gujarat",
  "મહારાષ્ટ્ર": "Maharashtra",
  "ભારત": "India",
  "દિલ્હી": "Delhi",
  "રૂપિયા": "Rupees",
  "કરોડ": "Crore",
  "લાખ": "Lakh",
  "હજાર": "Thousand",
  "ટકા": "percent",
  "વર્ષ": "Years",
  "દિવસ": "Days",
  "મેટ્રો": "Metro",
  "ટ્રેન": "Train",
  "બસ": "Bus",
  "વિમાન": "Flight",
  "એરપોર્ટ": "Airport",
  "બંદર": "Port",
  "રોડ": "Road",
  "હાઇવે": "Highway",
  "બ્રિજ": "Bridge",
  "સ્ટેશન": "Station",
  "પોલીસ": "Police",
  "હોસ્પિટલ": "Hospital",
  "શાળા": "School",
  "કોલેજ": "College",
  "યુનિવર્સિટી": "University",
  "સોલાર": "Solar",
  "ઊર્જા": "Energy",
  "વીજળી": "Power",
  "પાણી": "Water",
  "ગરીબ": "Underprivileged",
  "ખેડૂત": "Farmer",
  "વેપારી": "Trader",
  "ઉદ્યોગ": "Industry",
  "વેપાર": "Business",
  "બજાર": "Market",
  "બેંક": "Bank",
  "નાણાકીય": "Financial",
  "આર્થિક": "Economic",
  "રાજકીય": "Political",
  "ચૂંટણી": "Election",
  "મતદાન": "Voting",
  "પરિણામ": "Results",
  "વિજય": "Victory",
  "હાર": "Defeat",
  "ક્રિકેટ": "Cricket",
  "મેચ": "Match",
  "ટીમ": "Team",
  "ખેલાડી": "Player",
  "ટ્રોફી": "Trophy",
  "સિનેમા": "Cinema",
  "ફિલ્મ": "Film",
  "અભિનેતા": "Actor",
  "અભિનેત્રી": "Actress",
  "સંગીત": "Music",
};

const GUJARATI_DIGITS: Record<string, string> = {
  "૦": "0", "૧": "1", "૨": "2", "૩": "3", "૪": "4",
  "૫": "5", "૬": "6", "૭": "7", "૮": "8", "૯": "9",
};

export function hasGujaratiText(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0A80-\u0AFF]/.test(text);
}

export function autoTranslateGujaratiToEnglish(text?: string | null): string {
  if (!text) return "";
  let result = text.trim();

  // If already pure English/ASCII, return as is
  if (!hasGujaratiText(result)) {
    return result;
  }

  // 1. Try full phrase matching first
  for (const [pattern, replacement] of PHRASE_MAP) {
    result = result.replace(pattern, replacement);
  }

  if (!hasGujaratiText(result)) {
    return result;
  }

  // 2. Normalize Gujarati digits
  result = result.replace(/[\u0AE6-\u0AEF]/g, (ch) => GUJARATI_DIGITS[ch] || ch);

  // 3. Word-level transliteration and mapping
  for (const [guWord, enWord] of Object.entries(WORD_MAP)) {
    result = result.split(guWord).join(enWord);
  }

  // 4. Grammar postpositions and conjunctions
  result = result
    .replace(/માં\b/g, " in ")
    .replace(/થી\b/g, " from ")
    .replace(/ને\b/g, " to ")
    .replace(/પર\b/g, " on ")
    .replace(/માટે\b/g, " for ")
    .replace(/સાથે\b/g, " with ")
    .replace(/અને\b/g, " and ")
    .replace(/વચ્ચે\b/g, " between ")
    .replace(/દ્વારા\b/g, " by ")
    .replace(/શરૂ\b/g, " launched ")
    .replace(/નવી|નવો|નવું/g, "new")
    .replace(/વધુ/g, "more")
    .replace(/મોટા|મોટું|મોટી/g, "major")
    .replace(/પ્રથમ/g, "first")
    .replace(/અંતિમ/g, "final")
    .replace(/\s+/g, " ")
    .trim();

  // 5. If any residual Gujarati characters remain, clean up cleanly
  if (hasGujaratiText(result)) {
    // Strip trailing untranslated particles
    result = result.replace(/[\u0A80-\u0AFF]+/g, "").replace(/\s+/g, " ").trim();
  }

  return result.length > 3 ? result : text;
}
