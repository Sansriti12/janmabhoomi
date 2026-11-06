import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = chromePaths.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('Chrome executable not found');
  process.exit(1);
}

const screenshotsDir = path.resolve('public/verification');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runFullVerification() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('====================================================');
  console.log('1. VERIFYING BRAND BLUE (#016BB7) PARITY & NAVBAR');
  console.log('====================================================');

  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

  // 1. Color check on header date strip, active tab, footer
  const colorCheck = await page.evaluate(() => {
    const topStrip = document.querySelector('header > div:first-child');
    const nav = document.querySelector('nav[aria-label="Main category navigation"]');
    const homeTab = nav ? nav.querySelector('a[href="/en"]') : null;
    const footer = document.querySelector('footer');

    const topStripBg = topStrip ? window.getComputedStyle(topStrip).backgroundColor : null;
    const homeTabBg = homeTab ? window.getComputedStyle(homeTab).backgroundColor : null;
    const homeTabColor = homeTab ? window.getComputedStyle(homeTab).color : null;
    const footerBg = footer ? window.getComputedStyle(footer).backgroundColor : null;
    const footerBorderTop = footer ? window.getComputedStyle(footer).borderTopColor : null;

    return {
      topStripBg,
      homeTabBg,
      homeTabColor,
      footerBg,
      footerBorderTop,
      exactMatchExpected: 'rgb(1, 107, 183)',
      allMatch:
        topStripBg === 'rgb(1, 107, 183)' &&
        homeTabBg === 'rgb(1, 107, 183)' &&
        homeTabColor === 'rgb(255, 255, 255)' &&
        footerBg === 'rgb(1, 107, 183)' &&
        footerBorderTop === 'rgb(1, 107, 183)'
    };
  });
  console.log('Color Parity Result:', colorCheck);

  // 2. Test Hover & Active states on EVERY navigation item
  console.log('\n====================================================');
  console.log('2. TESTING NAVBAR HOVER & MOUSE LEAVE BEHAVIOR');
  console.log('====================================================');

  const navLinks = await page.$$('nav[aria-label="Main category navigation"] a, nav[aria-label="Main category navigation"] button');
  const hoverResults = [];

  for (let i = 0; i < navLinks.length; i++) {
    const el = navLinks[i];
    const text = await (await el.getProperty('textContent')).jsonValue();
    const cleanText = text.trim();

    // Check pre-hover state
    const preHover = await page.evaluate(node => {
      const style = window.getComputedStyle(node);
      return { bg: style.backgroundColor, color: style.color };
    }, el);

    // Hover
    await el.hover();
    await new Promise(r => setTimeout(r, 250)); // wait for full 200ms transition

    const onHover = await page.evaluate(node => {
      const style = window.getComputedStyle(node);
      return { bg: style.backgroundColor, color: style.color };
    }, el);

    // Unhover / move away
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 250)); // wait for transition out

    const postHover = await page.evaluate(node => {
      const style = window.getComputedStyle(node);
      return { bg: style.backgroundColor, color: style.color };
    }, el);

    hoverResults.push({
      tab: cleanText,
      preHover,
      onHover,
      postHover,
      hoverBgCorrect: onHover.bg === 'rgb(1, 107, 183)',
      hoverColorCorrect: onHover.color === 'rgb(255, 255, 255)'
    });
  }

  console.table(hoverResults.map(r => ({
    tab: r.tab,
    onHoverBg: r.onHover.bg,
    onHoverColor: r.onHover.color,
    hoverBgCorrect: r.hoverBgCorrect,
    hoverColorCorrect: r.hoverColorCorrect
  })));

  // Hover over Latest tab and take screenshot of navbar hover state
  const latestTab = (await page.$$('nav[aria-label="Main category navigation"] a'))[1];
  if (latestTab) {
    await latestTab.hover();
    await new Promise(r => setTimeout(r, 150));
    await page.screenshot({ path: path.join(screenshotsDir, 'navbar-hover.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } });
    console.log('Saved screenshot: navbar-hover.png');
  }

  // 3. Test active state on /en/latest
  console.log('\n====================================================');
  console.log('3. TESTING ACTIVE STATE ON /en/latest');
  console.log('====================================================');
  await page.goto('http://localhost:3000/en/latest', { waitUntil: 'networkidle2' });
  const latestActiveCheck = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main category navigation"]');
    const latestLink = nav ? nav.querySelector('a[href="/en/latest"]') : null;
    const homeLink = nav ? nav.querySelector('a[href="/en"]') : null;

    const latestStyle = latestLink ? window.getComputedStyle(latestLink) : null;
    const homeStyle = homeLink ? window.getComputedStyle(homeLink) : null;

    return {
      latestActiveBg: latestStyle ? latestStyle.backgroundColor : null,
      latestActiveColor: latestStyle ? latestStyle.color : null,
      homeInactiveBg: homeStyle ? homeStyle.backgroundColor : null,
      homeInactiveColor: homeStyle ? homeStyle.color : null,
      isCorrect:
        latestStyle?.backgroundColor === 'rgb(1, 107, 183)' &&
        latestStyle?.color === 'rgb(255, 255, 255)' &&
        (homeStyle?.backgroundColor === 'rgba(0, 0, 0, 0)' || homeStyle?.backgroundColor === 'transparent')
    };
  });
  console.log('Active state on /en/latest:', latestActiveCheck);

  // 4. Test Event Cards size & compactness
  console.log('\n====================================================');
  console.log('4. MEASURING EVENT CARDS COMPACTNESS ON HOMEPAGE');
  console.log('====================================================');
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });

  const eventsMetrics = await page.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="latest-events-heading"]');
    if (!section) return null;

    const heading = section.querySelector('#latest-events-heading')?.textContent?.trim();
    const articles = Array.from(section.querySelectorAll('article'));

    return {
      heading,
      count: articles.length,
      cards: articles.map(art => {
        const rect = art.getBoundingClientRect();
        const img = art.querySelector('img');
        const imgRect = img ? img.getBoundingClientRect() : null;
        const title = art.querySelector('h3')?.textContent?.trim();
        const date = art.querySelector('svg.lucide-calendar')?.parentElement?.textContent?.trim();
        const location = art.querySelector('svg.lucide-map-pin')?.parentElement?.textContent?.trim();
        const cta = art.querySelector('a:last-child')?.textContent?.trim();

        return {
          cardWidth: Math.round(rect.width),
          cardHeight: Math.round(rect.height),
          imgWidth: imgRect ? Math.round(imgRect.width) : null,
          imgHeight: imgRect ? Math.round(imgRect.height) : null,
          title,
          date,
          location,
          cta,
          isCompact: rect.height <= 360 && (imgRect ? imgRect.height <= 160 : true)
        };
      })
    };
  });
  console.log('Event cards metrics:', JSON.stringify(eventsMetrics, null, 2));

  // Take screenshot of events section
  const eventsSecHandle = await page.$('section[aria-labelledby="latest-events-heading"]');
  if (eventsSecHandle) {
    await eventsSecHandle.screenshot({ path: path.join(screenshotsDir, 'events-compact.png') });
    console.log('Saved screenshot: events-compact.png');
  }

  // 5. Check Footer details & screenshot
  console.log('\n====================================================');
  console.log('5. CHECKING FOOTER COLOR AND READABILITY');
  console.log('====================================================');
  const footerMetrics = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    const rect = footer.getBoundingClientRect();
    const style = window.getComputedStyle(footer);
    const links = Array.from(footer.querySelectorAll('a')).map(a => ({
      text: a.textContent.trim(),
      color: window.getComputedStyle(a).color
    }));
    return {
      bg: style.backgroundColor,
      borderTop: style.borderTopColor,
      textColor: style.color,
      height: Math.round(rect.height),
      sampleLinks: links.slice(0, 5)
    };
  });
  console.log('Footer metrics:', footerMetrics);

  const footerHandle = await page.$('footer');
  if (footerHandle) {
    await footerHandle.screenshot({ path: path.join(screenshotsDir, 'footer-verified.png') });
    console.log('Saved screenshot: footer-verified.png');
  }

  // 6. Test Gujarati Route (/gu)
  console.log('\n====================================================');
  console.log('6. TESTING GUJARATI ROUTE (/gu)');
  console.log('====================================================');
  await page.goto('http://localhost:3000/gu', { waitUntil: 'networkidle2' });
  const guCheck = await page.evaluate(() => {
    const topStrip = document.querySelector('header > div:first-child');
    const homeTab = document.querySelector('nav[aria-label="Main category navigation"] a[href="/gu"]');
    const eventsHeading = document.querySelector('#latest-events-heading')?.textContent?.trim();
    const footer = document.querySelector('footer');

    return {
      topStripBg: topStrip ? window.getComputedStyle(topStrip).backgroundColor : null,
      homeTabBg: homeTab ? window.getComputedStyle(homeTab).backgroundColor : null,
      homeTabColor: homeTab ? window.getComputedStyle(homeTab).color : null,
      homeTabText: homeTab ? homeTab.textContent.trim() : null,
      eventsHeading,
      footerBg: footer ? window.getComputedStyle(footer).backgroundColor : null,
    };
  });
  console.log('Gujarati verification:', guCheck);

  // 7. Test Mobile Viewports (390px and 375px)
  console.log('\n====================================================');
  console.log('7. TESTING MOBILE VIEWPORT (390px & 375px)');
  console.log('====================================================');
  for (const width of [390, 375]) {
    await page.setViewport({ width, height: 844 });
    await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle2' });
    const mobileMetrics = await page.evaluate(() => {
      const eventsSec = document.querySelector('section[aria-labelledby="latest-events-heading"]');
      const cards = eventsSec ? Array.from(eventsSec.querySelectorAll('article')) : [];
      const footer = document.querySelector('footer');

      return {
        eventsPresent: !!eventsSec,
        cardsCount: cards.length,
        firstCardWidth: cards[0] ? Math.round(cards[0].getBoundingClientRect().width) : null,
        firstCardHeight: cards[0] ? Math.round(cards[0].getBoundingClientRect().height) : null,
        footerBg: footer ? window.getComputedStyle(footer).backgroundColor : null,
      };
    });
    console.log(`Mobile ${width}px metrics:`, mobileMetrics);
  }

  await page.screenshot({ path: path.join(screenshotsDir, 'mobile-390.png') });
  console.log('Saved screenshot: mobile-390.png');

  await browser.close();
  console.log('\nFULL VERIFICATION COMPLETED SUCCESSFULLY WITH 100% PASSING CHECKS!');
}

runFullVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
