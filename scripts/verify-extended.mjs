import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runExtendedTests() {
  console.log('================================================================');
  console.log('     JANMABHOOMI EXTENDED BROWSER VALIDATION & STRESS TEST      ');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const report = {};

  try {
    const page = await browser.newPage();

    // ========================================================
    // TEST 1: CTA WORDING IN ENGLISH AND GUJARATI
    // ========================================================
    console.log('\n[TEST 1] Verifying CTA Wording in English and Gujarati...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

    const enCta = await page.evaluate(() => {
      const el = document.querySelector('section[aria-labelledby="category-carousel-heading"] a[href$="/category"]');
      return el ? el.textContent.trim() : null;
    });

    await page.goto('http://localhost:3000/gu', { waitUntil: 'networkidle2' });
    const guCta = await page.evaluate(() => {
      const el = document.querySelector('section[aria-labelledby="category-carousel-heading"] a[href$="/category"]');
      return el ? el.textContent.trim() : null;
    });

    report.ctaWording = {
      english: enCta,
      englishCorrect: enCta === 'Explore All Categories',
      gujarati: guCta,
      gujaratiCorrect: guCta === 'તમામ વિભાગો જુઓ'
    };
    console.log(`- English CTA: "${enCta}" (Expected: "Explore All Categories" -> ${enCta === 'Explore All Categories'})`);
    console.log(`- Gujarati CTA: "${guCta}" (Expected: "તમામ વિભાગો જુઓ" -> ${guCta === 'તમામ વિભાગો જુઓ'})`);

    // ========================================================
    // TEST 2: MANUAL INTERACTION & RESET BEHAVIOUR
    // ========================================================
    console.log('\n[TEST 2] Testing Category Carousel Manual Interaction (Next/Prev)...');
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

    const getFirstCategory = async () => {
      return await page.evaluate(() => {
        const badge = document.querySelector('section[aria-labelledby="category-carousel-heading"] .hidden.lg\\:grid article span.rounded-xs');
        return badge ? badge.textContent.trim() : '';
      });
    };

    const beforeClick = await getFirstCategory();
    console.log(`- Category before clicking Next: "${beforeClick}" (Group 1)`);

    // Click Next
    await page.click('button[aria-label="Next category group"]');
    await sleep(300);
    const afterNextClick = await getFirstCategory();
    console.log(`- Category after clicking Next: "${afterNextClick}" (Switched to Group 2: ${beforeClick !== afterNextClick})`);

    // Click Prev
    await page.click('button[aria-label="Previous category group"]');
    await sleep(300);
    const afterPrevClick = await getFirstCategory();
    console.log(`- Category after clicking Prev: "${afterPrevClick}" (Returned to Group 1: ${afterPrevClick === beforeClick})`);

    // Wait 11 seconds after manual click to ensure timer reset worked and advances smoothly
    console.log('- Waiting 11 seconds to verify timer resumed cleanly after manual interaction...');
    await sleep(11000);
    const afterResumedTimer = await getFirstCategory();
    console.log(`- Category after 11s timer resumption: "${afterResumedTimer}" (Auto-rotated: ${afterResumedTimer !== afterPrevClick})`);

    report.manualInteraction = {
      initial: beforeClick,
      afterNext: afterNextClick,
      afterPrev: afterPrevClick,
      afterResumedTimer: afterResumedTimer,
      immediateSwitchWorking: beforeClick !== afterNextClick && afterPrevClick === beforeClick,
      timerResumedSuccessfully: afterResumedTimer !== afterPrevClick
    };

    // ========================================================
    // TEST 3: COMPONENT UNMOUNT & REMOUNT (NAVIGATION CYCLE)
    // ========================================================
    console.log('\n[TEST 3] Testing Navigation Away & Returning (Unmount/Remount)...');
    console.log('- Navigating away to /en/about...');
    await page.goto('http://localhost:3000/en/about', { waitUntil: 'networkidle2' });
    await sleep(1000);

    console.log('- Navigating back to homepage /en...');
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

    const remountLead = await page.evaluate(() => {
      const h1 = document.querySelector('section h1');
      return h1 ? h1.textContent.trim() : '';
    });
    console.log(`- Remounted T=0s Lead Story: "${remountLead.substring(0, 45)}..."`);

    console.log('- Waiting 11s to verify timer starts and runs normally on fresh mount...');
    await sleep(11000);
    const remountRotatedLead = await page.evaluate(() => {
      const h1 = document.querySelector('section h1');
      return h1 ? h1.textContent.trim() : '';
    });
    console.log(`- Remounted T=11s Lead Story: "${remountRotatedLead.substring(0, 45)}..." (Rotated? ${remountLead !== remountRotatedLead})`);

    report.remountCycle = {
      remountLeadT0: remountLead,
      remountLeadT11: remountRotatedLead,
      successfullyRotatedOnRemount: remountLead !== remountRotatedLead
    };

    // ========================================================
    // TEST 4: MULTI-MINUTE CONTINUOUS ROTATION PROOF (60-SECOND EXTENDED RUN)
    // ========================================================
    console.log('\n[TEST 4] Multi-Cycle Continuous Autoplay Test (60 seconds monitor)...');
    console.log('Tracking every rotation across 6 full cycles...');

    const multiCycleLog = [];
    let prevLead = '';
    let prevCategory = '';

    for (let sec = 0; sec <= 60; sec += 2) {
      const state = await page.evaluate(() => {
        const h1 = document.querySelector('section h1');
        const badge = document.querySelector('section[aria-labelledby="category-carousel-heading"] .hidden.lg\\:grid article span.rounded-xs');
        return {
          lead: h1 ? h1.textContent.trim() : '',
          category: badge ? badge.textContent.trim() : ''
        };
      });

      if (state.lead !== prevLead || state.category !== prevCategory) {
        multiCycleLog.push({
          second: sec,
          leadStory: state.lead.substring(0, 40) + '...',
          firstCategory: state.category
        });
        console.log(`[T = ${sec}s] Lead: "${state.lead.substring(0, 35)}..." | First Category: "${state.category}"`);
        prevLead = state.lead;
        prevCategory = state.category;
      }
      await sleep(2000);
    }

    report.multiCycle = {
      totalTransitionsRecorded: multiCycleLog.length,
      transitions: multiCycleLog,
      sustainedRotationProven: multiCycleLog.length >= 6
    };

    // ========================================================
    // TEST 5: MOBILE LAYOUT AT 375px AND 390px
    // ========================================================
    console.log('\n[TEST 5] Testing Mobile Layout at 375px (iPhone SE) and 390px (iPhone 12/13/14)...');

    for (const width of [375, 390]) {
      await page.setViewport({ width, height: 800, isMobile: true, hasTouch: true });
      await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

      const mobileEval = await page.evaluate((w) => {
        const bodyScrollWidth = document.body.scrollWidth;
        const htmlClientWidth = document.documentElement.clientWidth;
        const noHorizontalSpill = bodyScrollWidth <= htmlClientWidth;

        // Check category mobile cards
        const mobileCards = Array.from(document.querySelectorAll('section[aria-labelledby="category-carousel-heading"] .lg\\:hidden article'));
        const cardCount = mobileCards.length;

        // Check text wrapping inside first mobile card
        const firstCardTitle = mobileCards[0] ? mobileCards[0].querySelector('h3, a.font-bold') : null;
        const titleComputed = firstCardTitle ? window.getComputedStyle(firstCardTitle) : null;

        // Check CTA
        const cta = document.querySelector('section[aria-labelledby="category-carousel-heading"] a[href$="/category"]');
        const ctaRect = cta ? cta.getBoundingClientRect() : null;

        return {
          viewportWidth: w,
          htmlClientWidth,
          bodyScrollWidth,
          noHorizontalSpill,
          mobileCardCount: cardCount,
          mobileCardsVisible: cardCount >= 12,
          ctaVisible: !!cta && (ctaRect ? ctaRect.width > 0 && ctaRect.height > 0 : false),
          ctaDimensions: ctaRect ? { width: Math.round(ctaRect.width), height: Math.round(ctaRect.height) } : null
        };
      }, width);

      report[`mobile_${width}px`] = mobileEval;
      console.log(`- Mobile ${width}px Evaluation:`, mobileEval);
    }

  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log('              EXTENDED BROWSER VALIDATION REPORT                ');
  console.log('================================================================');
  console.log(JSON.stringify(report, null, 2));
}

runExtendedTests().catch((err) => {
  console.error('Extended test failed:', err);
  process.exit(1);
});
