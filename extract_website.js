const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractLandingsitePreview(url, outputPath) {
    console.log(`🚀 Launching browser to extract: ${url}`);
    
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    try {
        console.log("⏳ Navigating to URL and waiting for network to settle...");
        // Go to the preview URL and wait until all resources (scripts/styles) stop loading
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        console.log("🔍 Looking for the website iframe...");
        // Wait for the iframe that Landingsite uses to display the preview
        await page.waitForSelector('iframe', { timeout: 10000 });
        const iframeElement = await page.$('iframe');
        const frame = await iframeElement.contentFrame();
        
        if (!frame) {
            throw new Error("Could not access the iframe content.");
        }

        console.log("⏱️ Waiting a few seconds for JavaScript to fully render the UI...");
        // Wait 3 seconds to ensure React/Redwood has fully injected the DOM components inside the iframe
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log("📥 Extracting the fully rendered HTML...");
        const html = await frame.content();
        
        // Write it to the specified output file
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`✅ Success! Website extracted to: ${outputPath}`);
        
    } catch (error) {
        console.error("❌ An error occurred during extraction:", error.message);
    } finally {
        await browser.close();
    }
}

// Check command-line arguments
const url = process.argv[2];
const outputPath = process.argv[3] || 'extracted_site.html';

if (!url) {
    console.log(`
Usage:
  node extract_website.js <PREVIEW_URL> [OUTPUT_FILE]

Example:
  node extract_website.js https://app.landingsite.ai/website-preview?id=f24bfd2a-136d-48fa-ae0d-f0f9f79fbe67 my_site.html
`);
    process.exit(1);
}

extractLandingsitePreview(url, outputPath);
