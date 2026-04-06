const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set extra headers to prevent cache
  await page.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });

  console.log('Navigating...');
  await page.goto('http://localhost:3000/?v=' + Date.now(), { waitUntil: 'networkidle2' });
  
  console.log('Waiting 3 seconds for preloader...');
  await new Promise(r => setTimeout(r, 3000));
  
  // Also check if preloader still exists and its opacity
  const preloaderStyle = await page.evaluate(() => {
    const p = document.getElementById('preloader');
    return p ? { opacity: p.style.opacity, display: p.style.display } : 'NOT_FOUND';
  });
  console.log('Preloader DOM State:', preloaderStyle);

  await page.screenshot({path: 'd:/ankush/verify.png'});
  console.log('Screenshot saved to verify.png');
  
  await browser.close();
})();
