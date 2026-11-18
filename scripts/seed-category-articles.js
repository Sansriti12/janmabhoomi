const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const ARTICLES = [
  {
    categorySlug: "business",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 7,
    gu: {
      slug: "sensex-crosses-85000-historic-bull-run",
      headline: "શેરબજારમાં ઐતિહાસિક તેજી: સેન્સેક્સ ૮૫,૦૦૦ને પાર, આઈટી અને બેન્કિંગ શેરોમાં જોરદાર ઉછાળો",
      summary: "વૈશ્વિક બજારોના સકારાત્મક સંકેતો અને વિદેશી સંસ્થાકીય રોકાણકારોની સતત ખરીદીને કારણે ભારતીય શેરબજારમાં નવો ઇતિહાસ રચાયો છે.",
      contentHtml: "<p>મુંબઈ: ભારતીય શેરબજારે આજે નવી ઐતિહાસિક ઊંચાઈ સર કરી છે. બોમ્બે સ્ટોક એક્સચેન્જનો સેન્સેક્સ ૮૫,૦૦૦ પોઈન્ટનો આંક વટાવી ગયો છે, જ્યારે નિફ્ટી પણ ૨૬,૦૦૦ની નજીક પહોંચ્યો છે.</p><p>બેન્કિંગ, આઈટી અને ઓટોમોબાઇલ ક્ષેત્રના અગ્રણી શેરોમાં વ્યાપક તેજી જોવા મળી છે. બજાર વિશ્લેષકોના જણાવ્યા અનુસાર દેશના આર્થિક વિકાસના મજબૂત આંકડા અને જીડીપી વૃદ્ધિ દરના કારણે રોકાણકારોનો વિશ્વાસ સતત વધી રહ્યો છે.</p>",
      readTimeMinutes: 4,
    },
    en: {
      slug: "sensex-crosses-85000-historic-bull-run-en",
      headline: "Historic Bull Run in Stock Markets: Sensex Crosses 85,000 as IT and Banking Equities Surge",
      summary: "Indian benchmark equity indices etched a historic milestone today propelled by robust foreign institutional inflows and stellar macroeconomic fundamentals.",
      contentHtml: "<p>Mumbai: The Indian stock market reached an all-time high today, with the BSE Sensex crossing the historic 85,000 mark and the Nifty touching new peaks.</p><p>Surging gains in blue-chip banking, technology, and capital goods stocks powered the rally. Financial analysts attributed the bullish sentiment to sustained domestic macroeconomic resilience and consistent GDP expansion figures.</p>",
      readTimeMinutes: 4,
    }
  },
  {
    categorySlug: "sports",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 11,
    gu: {
      slug: "india-vs-australia-second-test-victory",
      headline: "ભારત-ઓસ્ટ્રેલિયા ટેસ્ટ શ્રેણી: ભારતીય ટીમે બીજી ટેસ્ટમાં શાનદાર વિજય સાથે શ્રેણીમાં ૧-૦ની સરસાઈ મેળવી",
      summary: "ભારતીય બોલરો અને બેટ્સમેનોના સંયુક્ત શાનદાર પ્રદર્શનથી પ્રવાસી ઓસ્ટ્રેલિયા સામેની મહત્વપૂર્ણ બીજી ટેસ્ટ મેચમાં ભારતે ભવ્ય વિજય નોંધાવ્યો.",
      contentHtml: "<p>મેલબોર્ન: ભારતીય ક્રિકેટ ટીમે બોર્ડર-ગાવસ્કર ટ્રોફીની બીજી ટેસ્ટમાં યજમાન ઓસ્ટ્રેલિયાને ૬ વિકેટે પરાજય આપી શ્રેણીમાં અગ્રેસરતા મેળવી લીધી છે.</p><p>ભારતીય ઝડપી બોલરોએ બંને ઇનિંગ્સમાં શાનદાર બોલિંગ કરી વિરોધી ટીમને દબાણમાં રાખી હતી, જ્યારે મિડલ ઓર્ડરના બેટ્સમેનોએ સંયમિત ઇનિંગ રમી ટીમને વિજયના દ્વારે પહોંચાડી હતી.</p>",
      readTimeMinutes: 3,
    },
    en: {
      slug: "india-vs-australia-second-test-victory-en",
      headline: "India vs Australia Test Series: Team India Secures Dominant Victory in Second Test to Take 1-0 Lead",
      summary: "A clinical all-round performance from India's bowling attack and disciplined middle-order batting steered the team to an emphatic victory against Australia.",
      contentHtml: "<p>Melbourne: The Indian cricket team registered a commanding 6-wicket victory over Australia in the second Test match of the Border-Gavaskar Trophy to claim a 1-0 series advantage.</p><p>Pace bowlers delivered a masterclass across both innings to dismantle the Australian batting lineup, while resilient batting cemented the historic overseas win.</p>",
      readTimeMinutes: 3,
    }
  },
  {
    categorySlug: "entertainment",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 12,
    gu: {
      slug: "gujarati-cinema-international-award-honour",
      headline: "ગુજરાતી સિનેમાનો સુવર્ણ યુગ: આંતરરાષ્ટ્રીય ફિલ્મ ફેસ્ટિવલમાં ગુજરાતી ફીચર ફિલ્મને વિશેષ સન્માન",
      summary: "વૈશ્વિક મંચ પર ગુજરાતી સંસ્કૃતિ અને સંવેદનાઓને રજૂ કરતી કલાત્મક ફીચર ફિલ્મને પ્રતિષ્ઠિત ઇન્ટરનેશનલ ફિલ્મ ફેસ્ટિવલમાં ગોલ્ડન ટ્રોફી એનાયત કરાઈ.",
      contentHtml: "<p>ટોરોન્ટો / મુંબઈ: ગુજરાતી સિનેમા જગત માટે ગૌરવપૂર્ણ ક્ષણ ઊભી થઈ છે. પ્રતિષ્ઠિત ઇન્ટરનેશનલ ફિલ્મ ફેસ્ટિવલમાં નવી ગુજરાતી ફિલ્મે દર્શકો અને વિવેચકોના દિલ જીતી લીધા છે.</p><p>દિગ્દર્શક અને કલાકારોએ જણાવ્યું હતું કે આ એવોર્ડ સમગ્ર ગુજરાતી કલા જગત અને કલાપ્રેમી જનતાને સમર્પિત છે.</p>",
      readTimeMinutes: 3,
    },
    en: {
      slug: "gujarati-cinema-international-award-honour-en",
      headline: "Golden Era of Gujarati Cinema: Gujarati Feature Film Receives Special Honors at International Film Festival",
      summary: "A critically acclaimed Gujarati narrative feature depicting cultural ethos and poignant human drama was awarded top honors at the prestigious International Film Festival.",
      contentHtml: "<p>Toronto / Mumbai: In a proud achievement for regional Indian cinema, a groundbreaking Gujarati feature film garnered standing ovations and critical acclaim at the prestigious international festival.</p><p>The creative team dedicated the milestone to the thriving artistic community and devoted readers across Western India.</p>",
      readTimeMinutes: 3,
    }
  },
  {
    categorySlug: "editorial",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 8,
    gu: {
      slug: "institutional-editorial-civic-governance",
      headline: "અગ્રલેખ: લોકશાહીમાં સંસ્થાઓની સ્વાયત્તતા અને નાગરિક અધિકારોનું સંરક્ષણ સર્વોપરી",
      summary: "આધુનિક શાસન વ્યવસ્થામાં પારદર્શિતા, જવાબદેહી અને જાહેર સંસ્થાઓની વિશ્વસનીયતા જ પ્રજાહિતની સાચી ખાતરી આપી શકે છે.",
      contentHtml: "<p>જન્મભૂમિ સંપાદકીય વિચાર: કોઈ પણ લોકશાહી રાજ્યની સાચી તાકાત તેના કાયદાઓ કરતાં તેની સંસ્થાઓના નૈતિક વજન પર નિર્ભર રહે છે. જાહેર સેવા અને ન્યાયિક પ્રક્રિયામાં જ્યારે પારદર્શિતા જળવાય છે, ત્યારે પ્રજાનો વ્યવસ્થા પરનો વિશ્વાસ દ્રઢ બને છે.</p><p>સૌરાષ્ટ્ર ટ્રસ્ટના ૯૦ વર્ષથી વધુના પત્રકારત્વનું આ સનાતન મૂલ્ય રહ્યું છે કે શાસન સત્તાના કોઈપણ નિર્ણયની કસોટી સામાન્ય નાગરિકના હિતની એરણે જ થવી જોઈએ.</p>",
      readTimeMinutes: 5,
    },
    en: {
      slug: "institutional-editorial-civic-governance-en",
      headline: "Editorial: Institutional Autonomy in Democracy and the Uncompromising Protection of Civic Rights",
      summary: "In modern constitutional governance, transparent institutional oversight and civic equity remain the ultimate safeguards of democratic integrity.",
      contentHtml: "<p>Janmabhoomi Editorial View: The enduring vigor of democratic society rests fundamentally on the moral independence and ethical fortitude of public institutions. When public administration remains accountable, citizen confidence in civic systems is reinforced.</p><p>For over nine decades, the institutional bedrock of Saurashtra Trust has maintained that policy must always be measured by its tangible benefit to the grassroots citizen.</p>",
      readTimeMinutes: 5,
    }
  },
  {
    categorySlug: "maran",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 10,
    gu: {
      slug: "obituary-notice-renowned-educationist",
      headline: "મરણ નોંધ: જાણીતા શિક્ષણશાસ્ત્રી અને સમાજસેવકનું મુંબઈમાં દુઃખદ અવસાન; ગુરુવારે બેસણું યોજાશે",
      summary: "મુંબઈ અને ગુજરાતના અનેક વિદ્યાલયોના સ્થાપક અને કન્યા કેળવણીના પ્રણેતા શિક્ષણવિદનું ૮૮ વર્ષની વયે શાંતિપૂર્ણ અવસાન.",
      contentHtml: "<p>મુંબઈ: દક્ષિણ મુંબઈ સ્થિત જાણીતી શૈક્ષણિક સંસ્થાઓના ટ્રસ્ટી અને દાયકાઓથી કન્યા કેળવણીને સમર્પિત વડીલનું ગઈકાલે રાત્રે તેમના નિવાસસ્થાને દેહાવસાન થયું છે.</p><p>તેમનું બેસણું ગુરુવારે સાંજે ૫:૦૦ થી ૭:૦૦ વાગ્યા દરમિયાન માટુંગા સ્થિત સામાજિક હોલમાં રાખવામાં આવ્યું છે. સૌ સગાં-સ્નેહીઓને આ શોક સંદેશ પાઠવવામાં આવે છે.</p>",
      readTimeMinutes: 2,
    },
    en: {
      slug: "obituary-notice-renowned-educationist-en",
      headline: "Obituary Notice: Renowned Educationist and Philanthropist Passes Away in Mumbai; Memorial Besanu on Thursday",
      summary: "Pioneer of higher education and women's educational trusts across Mumbai and Gujarat passes away peacefully at age 88.",
      contentHtml: "<p>Mumbai: The revered founder and trustee of notable educational academies in South Mumbai passed away peacefully at his residence yesterday evening.</p><p>Memorial Besanu prayers will be held on Thursday between 5:00 PM and 7:00 PM at the Matunga community center. Relatives and well-wishers are kindly invited to pay their respects.</p>",
      readTimeMinutes: 2,
    }
  },
  {
    categorySlug: "events",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 5,
    gu: {
      slug: "janmabhoomi-annual-literary-awards-conclave",
      headline: "જન્મભૂમિ વાર્ષિક સાહિત્યિક સંવાદ અને પત્રકારત્વ પુરસ્કાર સમારોહ મુંબઈમાં સફળતાપૂર્વક સંપન્ન",
      summary: "સૌરાષ્ટ્ર ટ્રસ્ટ દ્વારા આયોજિત ભવ્ય સમારોહમાં અગ્રણી સાહિત્યકારો, વરિષ્ઠ સંપાદકો અને સમાજશ્રેષ્ઠીઓનું વિશેષ સન્માન કરાયું.",
      contentHtml: "<p>મુંબઈ: નરીમાન પોઈન્ટ સ્થિત ઓડિટોરિયમ ખાતે જન્મભૂમિ જૂથ દ્વારા આયોજિત વાર્ષિક સાહિત્ય સંવાદ અને સન્માન સમારોહમાં મોટી સંખ્યામાં વાચકો અને મહાનુભાવો ઉપસ્થિત રહ્યા હતા.</p><p>ટ્રસ્ટી મંડળે સાહિત્ય, પત્રકારત્વ અને સંશોધન ક્ષેત્રે ઉત્કૃષ્ટ પ્રદાન આપનાર પ્રતિભાઓને પ્રશસ્તિપત્ર અને સ્મૃતિચિહ્ન અર્પણ કર્યા હતા.</p>",
      readTimeMinutes: 4,
    },
    en: {
      slug: "janmabhoomi-annual-literary-awards-conclave-en",
      headline: "Janmabhoomi Annual Literary Conclave & Journalism Awards Concludes with Great Distinction in Mumbai",
      summary: "Eminent authors, veteran news editors, and civic luminaries felicitated at the grand cultural gathering hosted by Saurashtra Trust.",
      contentHtml: "<p>Mumbai: The annual literary gathering and journalism felicitation conclave organized by Janmabhoomi drew a packed audience of literary figures, scholars, and community leaders at Nariman Point.</p><p>The Board of Trustees bestowed lifetime achievement citations and trophies upon distinguished contributors to Indian literature and investigative journalism.</p>",
      readTimeMinutes: 4,
    }
  },
  {
    categorySlug: "city",
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 3,
    gu: {
      slug: "mumbai-coastal-road-phase-two-inauguration",
      headline: "મુંબઈ કોસ્ટલ રોડના બીજા તબક્કાનું લોકાર્પણ: દક્ષિણ મુંબઈથી ઉપનગરો સુધી ટ્રાફિક મુક્ત મુસાફરી",
      summary: "નવા એક્સપ્રેસવે કોરિડોરના બીજા તબક્કાના પ્રારંભથી મરીન ડ્રાઇવથી બાંદ્રા-વર્સોવા વચ્ચે પ્રવાસનો સમય ૭૦% ઘટી ગયો છે.",
      contentHtml: "<p>મુંબઈ: મહાનગરપાલિકાના મહત્વકાંક્ષી કોસ્ટલ રોડ પ્રોજેક્ટના બીજા તબક્કાનું આજે સત્તાવાર લોકાર્પણ કરવામાં આવ્યું છે. આ સાથે જ દરિયાઈ માર્ગે મુસાફરી કરતા લાખો વાહનચાલકોને મોટી રાહત મળશે.</p><p>અધિકારીઓએ જણાવ્યું હતું કે આધુનિક સુરક્ષા વ્યવસ્થા, એક્સપ્રેસ સર્વેલન્સ અને અદ્યતન ટનલિંગ ટેક્નોલોજીથી સજ્જ આ માર્ગ પર ૨૪ કલાક વાહનવ્યવહાર ચાલુ રહેશે.</p>",
      readTimeMinutes: 3,
    },
    en: {
      slug: "mumbai-coastal-road-phase-two-inauguration-en",
      headline: "Inauguration of Mumbai Coastal Road Phase II: Congestion-Free Commute from South Mumbai to Suburbs",
      summary: "Commencing the advanced corridor cuts driving duration between Marine Drive and the Western suburbs by over 70%, transforming city mobility.",
      contentHtml: "<p>Mumbai: The municipal corporation has officially opened Phase II of the landmark Coastal Road Project, offering immediate transit relief to thousands of daily commuters.</p><p>Civic engineers confirmed that the sea-facing express route features 24x7 intelligent traffic management, high-safety subsea tunnels, and scenic promenades.</p>",
      readTimeMinutes: 3,
    }
  },
  {
    categorySlug: "national",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    epaperPageNumber: 4,
    gu: {
      slug: "parliament-winter-session-economic-reforms",
      headline: "સંસદનું શિયાળુ સત્ર: આર્થિક સુધારા અને નાગરિક સુરક્ષા સાથે જોડાયેલા મહત્વપૂર્ણ ખરડાઓ રજૂ",
      summary: "નવી દિલ્હીમાં સંસદના બંને ગૃહોમાં ડિજિટલ અર્થતંત્ર, નિકાસ પ્રોત્સાહન અને ગ્રામીણ ઈન્ફ્રાસ્ટ્રક્ચર સંબંધિત વિધેયકો પર ગહન ચર્ચા.",
      contentHtml: "<p>નવી દિલ્હી: સંસદના શિયાળુ સત્રમાં આજે બંને ગૃહોમાં મહત્વપૂર્ણ કાયદાકીય કાર્યો હાથ ધરવામાં આવ્યા હતા. નાણામંત્રીએ ઉત્પાદન ક્ષેત્ર અને નિકાસ વૃદ્ધિને પ્રોત્સાહન આપતા નવા આર્થિક સુધારા રજૂ કર્યા હતા.</p><p>વિપક્ષી સભ્યોએ પણ ખેડૂતો અને નાના વેપારીઓના પ્રશ્નો પર રચનાત્મક સૂચનો રજૂ કર્યા હતા, જેનાથી સત્રનું વાતાવરણ સકારાત્મક રહ્યું હતું.</p>",
      readTimeMinutes: 4,
    },
    en: {
      slug: "parliament-winter-session-economic-reforms-en",
      headline: "Parliament Winter Session: Key Legislative Bills on Economic Reforms and Citizen Welfare Introduced",
      summary: "Substantive debates convened in both Houses of Parliament covering digital economy incentives, export facilitation, and rural infrastructure financing.",
      contentHtml: "<p>New Delhi: Both Houses of Parliament conducted pivotal legislative business today as Union ministers introduced comprehensive bills aimed at modernizing supply chains and fostering MSME competitiveness.</p><p>Constructive dialogues were witnessed across party lines regarding grassroots credit access, underscoring high legislative productivity.</p>",
      readTimeMinutes: 4,
    }
  }
];

async function seed() {
  console.log(`Starting to seed ${ARTICLES.length} category mock articles...`);

  for (const item of ARTICLES) {
    // Check if an article already exists for this slug
    const existing = await prisma.articleTranslation.findFirst({
      where: { slug: item.gu.slug }
    });

    if (existing) {
      console.log(`Article for ${item.categorySlug} already exists, skipping.`);
      continue;
    }

    const article = await prisma.article.create({
      data: {
        publicationId: "pub-janmabhoomi",
        categoryId: item.categorySlug,
        status: "PUBLISHED",
        primaryLanguage: "gu",
        featuredImageUrl: item.imageUrl,
        epaperPageNumber: item.epaperPageNumber,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              language: "gu",
              slug: item.gu.slug,
              headline: item.gu.headline,
              summary: item.gu.summary,
              teaserParagraphs: [item.gu.summary],
              contentHtml: item.gu.contentHtml,
              readTimeMinutes: item.gu.readTimeMinutes,
              translationStatus: "COMPLETED",
            },
            {
              language: "en",
              slug: item.en.slug,
              headline: item.en.headline,
              summary: item.en.summary,
              teaserParagraphs: [item.en.summary],
              contentHtml: item.en.contentHtml,
              readTimeMinutes: item.en.readTimeMinutes,
              translationStatus: "COMPLETED",
            }
          ]
        }
      }
    });

    console.log(`✓ Seeded article for [${item.categorySlug}]: ${article.id}`);
  }

  console.log("Finished seeding all category articles successfully!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
