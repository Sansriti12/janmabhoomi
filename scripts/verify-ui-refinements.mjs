import puppeteer from 'puppeteer-core';
import { existsSync } from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = chromePaths.find((p) => existsSync(p));
if (!executablePath) {
  console.error('Chrome executable not found');
  process.exit(1);
}

async function runTests() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('--- TEST 1: DESKTOP HOMEPAGE (/en) ---');
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

  // 1. Check Navbar
  const navEvaluation = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main category navigation"]');
    if (!nav) return { found: false };

    const classes = nav.className;
    const hasDivide = classes.includes('divide-x');
    const hasGrid = classes.includes('grid');

    const homeLink = nav.querySelector('a[href="/en"]');
    const homeStyles = homeLink ? window.getComputedStyle(homeLink) : null;

    // Check Publications button
    const buttons = Array.from(nav.querySelectorAll('button'));
    const pubButton = buttons.find(b => b.textContent.includes('Publications'));
    const moreButton = buttons.find(b => b.textContent.includes('More'));

    return {
      found: true,
      hasDivide,
      hasGrid,
      homeLinkText: homeLink ? homeLink.textContent.trim() : null,
      homeTextColor: homeStyles ? homeStyles.color : null,
      homeBorderBottomColor: homeStyles ? homeStyles.borderBottomColor : null,
      homeBorderBottomWidth: homeStyles ? homeStyles.borderBottomWidth : null,
      homeBgColor: homeStyles ? homeStyles.backgroundColor : null,
      hasPubButton: !!pubButton,
      hasMoreButton: !!moreButton,
    };
  });
  console.log('Navbar evaluation:', navEvaluation);

  // 2. Check Brand Blue standardisation
  const blueEvaluation = await page.evaluate(() => {
    const headerStrip = document.querySelector('header > div:first-child');
    const headerStripBg = headerStrip ? window.getComputedStyle(headerStrip).backgroundColor : null;

    const footer = document.querySelector('footer');
    const footerBg = footer ? window.getComputedStyle(footer).backgroundColor : null;

    return {
      headerStripBg,
      footerBg,
      matchesBrandBlue: headerStripBg === 'rgb(1, 107, 183)' && footerBg === 'rgb(1, 107, 183)',
    };
  });
  console.log('Brand blue check (#016BB7 is rgb(1, 107, 183)):', blueEvaluation);

  // 3. Check Homepage Section Ordering
  const sectionOrder = await page.evaluate(() => {
    const mainContainer = document.querySelector('main .space-y-4, main .space-y-6, main > div');
    const sections = Array.from(mainContainer.children);
    return sections.map((sec, idx) => {
      const heading = sec.querySelector('h1, h2, h3, [role="region"]');
      const text = (sec.textContent || '').trim().slice(0, 60);
      return { index: idx, heading: heading ? heading.textContent.trim() : 'no-heading', preview: text };
    });
  });
  console.log('Section Order on Homepage:', JSON.stringify(sectionOrder, null, 2));

  // 4. Check Latest Events Section
  const eventsEvaluation = await page.evaluate(() => {
    const eventsSec = document.querySelector('section[aria-labelledby="latest-events-heading"]');
    if (!eventsSec) return { found: false };

    const heading = eventsSec.querySelector('#latest-events-heading');
    const viewAllLink = eventsSec.querySelector('a[href="/en/events"]');
    const articles = Array.from(eventsSec.querySelectorAll('article'));

    const cards = articles.map(art => {
      const title = art.querySelector('h3');
      const img = art.querySelector('img');
      const metaText = art.textContent;
      const cta = art.querySelector('a:last-child');
      return {
        title: title ? title.textContent.trim() : null,
        hasImage: !!img,
        imgSrc: img ? img.src : null,
        hasCta: !!cta,
        ctaText: cta ? cta.textContent.trim() : null,
        ctaHref: cta ? cta.getAttribute('href') : null,
      };
    });

    return {
      found: true,
      headingText: heading ? heading.textContent.trim() : null,
      hasViewAll: !!viewAllLink,
      viewAllHref: viewAllLink ? viewAllLink.getAttribute('href') : null,
      cardCount: cards.length,
      cards,
    };
  });
  console.log('Latest Events evaluation:', eventsEvaluation);

  // 5. Test Gujarati (/gu)
  console.log('\n--- TEST 2: GUJARATI HOMEPAGE (/gu) ---');
  await page.goto('http://localhost:3000/gu', { waitUntil: 'networkidle2' });
  const guEvaluation = await page.evaluate(() => {
    const eventsSec = document.querySelector('section[aria-labelledby="latest-events-heading"]');
    const nav = document.querySelector('nav[aria-label="Main category navigation"]');
    const homeLink = nav ? nav.querySelector('a[href="/gu"]') : null;

    return {
      eventsHeading: eventsSec ? eventsSec.querySelector('#latest-events-heading')?.textContent?.trim() : null,
      viewAllText: eventsSec ? eventsSec.querySelector('a[href="/gu/events"]')?.textContent?.trim() : null,
      homeLinkText: homeLink ? homeLink.textContent.trim() : null,
    };
  });
  console.log('Gujarati evaluation:', guEvaluation);

  // 6. Test Mobile Viewport (375px & 390px)
  console.log('\n--- TEST 3: MOBILE VIEWPORT (390px) ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

  const mobileEvaluation = await page.evaluate(() => {
    const desktopNav = document.querySelector('nav[aria-label="Main category navigation"]');
    const desktopNavVisible = desktopNav && window.getComputedStyle(desktopNav.parentElement.parentElement).display !== 'none';
    const eventsSec = document.querySelector('section[aria-labelledby="latest-events-heading"]');
    const categorySec = document.querySelector('section[aria-labelledby="category-carousel-heading"]');

    return {
      desktopNavVisible,
      eventsSecPresent: !!eventsSec,
      categorySecPresent: !!categorySec,
    };
  });
  console.log('Mobile evaluation:', mobileEvaluation);

  await browser.close();
  console.log('\nVerification completed successfully!');
}

runTests().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
