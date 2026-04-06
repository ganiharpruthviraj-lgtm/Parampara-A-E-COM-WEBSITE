const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const pages = [
    { name: 'home', url: 'http://localhost:3001/' },
    { name: 'states', url: 'http://localhost:3001/states.html' },
    { name: 'artisans', url: 'http://localhost:3001/artisans.html' },
    { name: 'search', url: 'http://localhost:3001/search.html' }
  ];

  for (const pageInfo of pages) {
    const page = await browser.newPage();
    console.log(`Testing ${pageInfo.name}...`);
    try {
      await page.goto(pageInfo.url + '?nocache=' + Date.now(), { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 4000));
      await page.screenshot({ path: `d:/ankush/test_${pageInfo.name}.png` });
      console.log(`Screenshot saved for ${pageInfo.name}`);
    } catch (e) {
      console.error(`Failed ${pageInfo.name}:`, e);
    }
    await page.close();
  }
  await browser.close();
  console.log('Test suite finished');
})();
