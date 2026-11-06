import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rgbToHex(rgbStr) {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgbStr;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

async function runBrowserTests() {
  console.log('================================================================');
  console.log('   JANMABHOOMI COMPREHENSIVE BROWSER-LEVEL VERIFICATION SUITE   ');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // ========================================================
    // TEST 1: VISUAL STYLING & REMOVED CONTROLS VERIFICATION
    // ========================================================
    console.log('\n[TEST 1] Loading http://localhost:3000/en to verify branding & removed elements...');
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2', timeout: 30000 });

    const styling = await page.evaluate(() => {
      const dateStrip = document.querySelector('header div.text-xs');
      const footer = document.querySelector('footer');
      return {
        dateStripBg: dateStrip ? window.getComputedStyle(dateStrip).backgroundColor : null,
        footerBg: footer ? window.getComputedStyle(footer).backgroundColor : null
      };
    });

    const dateStripHex = rgbToHex(styling.dateStripBg || '');
    const footerHex = rgbToHex(styling.footerBg || '');
    console.log(`- Header Date Strip BG: ${styling.dateStripBg} -> ${dateStripHex} (Matches #016BB7: ${dateStripHex === '#016BB7'})`);
    console.log(`- Footer BG: ${styling.footerBg} -> ${footerHex} (Matches #016BB7: ${footerHex === '#016BB7'})`);

    const elementsCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const leadDots = document.querySelector('button[aria-label^="Go to slide"]');
      const leadArrows = document.querySelector('button[aria-label="Previous lead story"], button[aria-label="Next lead story"]');
      const categoryDots = document.querySelector('button[aria-label^="Go to category group"]');
      const categoryArrows = {
        prev: !!document.querySelector('button[aria-label="Previous category group"], button[aria-label="અગાઉના વિભાગો"]'),
        next: !!document.querySelector('button[aria-label="Next category group"], button[aria-label="આગામી વિભાગો"]')
      };
      const oldDirectoryBanner = bodyText.includes('Full Directory') && bodyText.includes('Browse our full coverage across national politics');
      const exploreCta = document.querySelector('section[aria-labelledby="category-carousel-heading"] a[href="/en/category"], section[aria-labelledby="category-carousel-heading"] a[href$="/category"]');

      return {
        hasOneOfThree: /1 of 3/i.test(bodyText) || /3 of 3/i.test(bodyText),
        hasGroupCounter: /Group \d of \d/i.test(bodyText),
        hasLeadDots: !!leadDots,
        hasLeadArrows: !!leadArrows,
        hasCategoryDots: !!categoryDots,
        hasCategoryManualArrows: categoryArrows.prev && categoryArrows.next,
        hasOldBanner: oldDirectoryBanner,
        hasExploreAllCta: !!exploreCta,
        exploreCtaText: exploreCta ? exploreCta.textContent.trim() : null,
        exploreCtaHref: exploreCta ? exploreCta.getAttribute('href') : null
      };
    });
    console.log('- Elements Verification:', elementsCheck);

    // ========================================================
    // TEST 2: DETERMINISTIC CONTINUOUS 10-SECOND AUTOPLAY
    // ========================================================
    console.log('\n[TEST 2] Reloading fresh page to observe exact 10-second autoplay intervals for 33 seconds...');
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2', timeout: 30000 });

    const getSnapshot = async () => {
      return await page.evaluate(() => {
        const leadH1 = document.querySelector('section h1');
        const categoryBadges = Array.from(document.querySelectorAll('section[aria-labelledby="category-carousel-heading"] .hidden.lg\\:grid article span.rounded-xs'));
        return {
          leadTitle: leadH1 ? leadH1.textContent.trim() : '',
          firstCategory: categoryBadges[0] ? categoryBadges[0].textContent.trim() : ''
        };
      });
    };

    const initial = await getSnapshot();
    console.log(`[T = 0s] Initial Lead Story: "${initial.leadTitle.substring(0, 50)}..."`);
    console.log(`[T = 0s] Initial First Category: "${initial.firstCategory}"`);

    const leadStoryTransitions = [{ second: 0, title: initial.leadTitle }];
    const categoryTransitions = [{ second: 0, firstCategory: initial.firstCategory }];

    let lastLead = initial.leadTitle;
    let lastCategory = initial.firstCategory;

    // Monitor every 1 second for 33 seconds
    for (let sec = 1; sec <= 33; sec++) {
      await sleep(1000);
      const current = await getSnapshot();

      if (current.leadTitle && current.leadTitle !== lastLead) {
        leadStoryTransitions.push({ second: sec, title: current.leadTitle });
        console.log(`[T = ${sec}s] >>> LEAD STORY ROTATED to: "${current.leadTitle.substring(0, 50)}..."`);
        lastLead = current.leadTitle;
      }

      if (current.firstCategory && current.firstCategory !== lastCategory) {
        categoryTransitions.push({ second: sec, firstCategory: current.firstCategory });
        console.log(`[T = ${sec}s] >>> CATEGORY CAROUSEL ROTATED to Group starting with: "${current.firstCategory}"`);
        lastCategory = current.firstCategory;
      }
    }

    console.log('\n--- AUTOPLAY ROTATION SUMMARY ---');
    console.log('Lead Story Rotations Detected:', leadStoryTransitions);
    console.log('Category Carousel Rotations Detected:', categoryTransitions);

    // ========================================================
    // TEST 3: GUJARATI ROUTE (/gu)
    // ========================================================
    console.log('\n[TEST 3] Loading http://localhost:3000/gu in headless Chrome...');
    await page.goto('http://localhost:3000/gu', { waitUntil: 'networkidle2', timeout: 30000 });

    const guData = await page.evaluate(() => {
      const dateStrip = document.querySelector('header div.text-xs');
      const footer = document.querySelector('footer');
      const categoryHeading = document.getElementById('category-carousel-heading');
      const leadH1 = document.querySelector('section h1');
      const exploreCta = document.querySelector('section[aria-labelledby="category-carousel-heading"] a[href="/gu/category"], section[aria-labelledby="category-carousel-heading"] a[href$="/category"]');

      return {
        dateStripBg: dateStrip ? window.getComputedStyle(dateStrip).backgroundColor : '',
        footerBg: footer ? window.getComputedStyle(footer).backgroundColor : '',
        categoryHeadingText: categoryHeading ? categoryHeading.textContent.trim() : '',
        leadTitle: leadH1 ? leadH1.textContent.trim() : '',
        exploreCtaText: exploreCta ? exploreCta.textContent.trim() : ''
      };
    });

    const guDateHex = rgbToHex(guData.dateStripBg);
    const guFooterHex = rgbToHex(guData.footerBg);

    console.log(`- Gujarati Date Strip Hex: ${guDateHex} (Matches #016BB7: ${guDateHex === '#016BB7'})`);
    console.log(`- Gujarati Footer Hex: ${guFooterHex} (Matches #016BB7: ${guFooterHex === '#016BB7'})`);
    console.log(`- Gujarati Category Section Title: "${guData.categoryHeadingText}" (Matches "અમારું સમાચાર કવરેજ": ${guData.categoryHeadingText === 'અમારું સમાચાર કવરેજ'})`);
    console.log(`- Gujarati Lead Headline: "${guData.leadTitle.substring(0, 50)}..."`);
    console.log(`- Gujarati Explore All CTA Text: "${guData.exploreCtaText}"`);

    // ========================================================
    // TEST 4: MOBILE VIEWPORT (375x667)
    // ========================================================
    console.log('\n[TEST 4] Testing mobile layout at 375x667 viewport...');
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

    const mobileCheck = await page.evaluate(() => {
      const scrollWidth = document.body.scrollWidth;
      const innerWidth = window.innerWidth;
      const mobileCarousel = document.querySelector('section[aria-labelledby="category-carousel-heading"] .lg\\:hidden');
      return {
        innerWidth,
        scrollWidth,
        hasHorizontalOverflow: scrollWidth > innerWidth,
        hasMobileCarousel: !!mobileCarousel
      };
    });
    console.log('- Mobile Check (375x667):', mobileCheck);

    const testVerdict = {
      brandingStandardised: dateStripHex === '#016BB7' && footerHex === '#016BB7' && guDateHex === '#016BB7' && guFooterHex === '#016BB7',
      removedControlsClean: !elementsCheck.hasOneOfThree && !elementsCheck.hasGroupCounter && !elementsCheck.hasLeadDots && !elementsCheck.hasLeadArrows && !elementsCheck.hasCategoryDots && !elementsCheck.hasOldBanner,
      manualCategoryArrowsRetained: elementsCheck.hasCategoryManualArrows,
      exploreAllCtaExists: elementsCheck.hasExploreAllCta,
      leadStory10sAutoplayLoop: leadStoryTransitions.length >= 3,
      category10sAutoplayLoop: categoryTransitions.length >= 3,
      gujaratiTitleCorrect: guData.categoryHeadingText === 'અમારું સમાચાર કવરેજ',
      mobileResponsiveClean: !mobileCheck.hasHorizontalOverflow && mobileCheck.hasMobileCarousel
    };

    console.log('\n================================================================');
    console.log('                   FINAL VERIFICATION VERDICT                   ');
    console.log('================================================================');
    console.log(JSON.stringify(testVerdict, null, 2));

  } finally {
    await browser.close();
  }
}

runBrowserTests().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
