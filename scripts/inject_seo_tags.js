/**
 * GSD Phase 2 — SEO Meta Tag Injector
 * Adds <title>, <meta description>, and Open Graph tags to all HTML pages.
 * Safe to re-run: skips pages that already have og:title set.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://parampara-a-e-com-website.vercel.app';
const OG_IMAGE = `${BASE_URL}/assets/og-cover.jpg`;

// Page-specific SEO metadata
const PAGE_META = {
  'index.html': {
    title: 'Parampara — Authentic Indian GI-Tagged Heritage Crafts',
    description: 'Discover authentic GI-tagged Indian handicrafts from 28 states. Shop Banarasi silk, Jaipur Blue Pottery, Bastar Dokra & more — with transparent 70% direct artisan payouts.',
    ogTitle: 'Parampara | Authentic Indian Heritage Crafts Marketplace',
    ogImage: OG_IMAGE
  },
  'about.html': {
    title: 'About Parampara — Our Mission to Preserve Indian Craft Heritage',
    description: 'Learn about Parampara's mission to preserve India's GI-tagged handicraft traditions, empower master artisans with transparent 70% direct payouts, and fight counterfeits.',
    ogTitle: 'About Parampara | Preserving Indian Craft Heritage',
    ogImage: OG_IMAGE
  },
  'artisans.html': {
    title: 'Master Artisans — Shilp Gurus & National Award Winners | Parampara',
    description: 'Meet India\'s master artisans — Shilp Gurus, Padma awardees, and cooperative guild leaders whose families have kept ancient craft traditions alive for generations.',
    ogTitle: 'Master Artisans | Parampara Heritage Marketplace',
    ogImage: OG_IMAGE
  },
  'artisan-dashboard.html': {
    title: 'Artisan Dashboard — Manage Your Craft Listings | Parampara',
    description: 'Artisan portal to manage GI-tagged craft listings, track sales, and view your 70% direct payout earnings in real time.',
    ogTitle: 'Artisan Dashboard | Parampara',
    ogImage: OG_IMAGE
  },
  'checkout.html': {
    title: 'Checkout — Certified Heritage Purchase | Parampara',
    description: 'Complete your heritage craft purchase with transparent 70% artisan payout breakdown, Razorpay secure checkout, and downloadable GI authenticity certificate.',
    ogTitle: 'Checkout | Parampara Heritage Crafts',
    ogImage: OG_IMAGE
  },
  'collection.html': {
    title: 'My Collection — Saved Heritage Masterpieces | Parampara',
    description: 'View and manage your curated collection of saved GI-tagged Indian masterpieces on Parampara.',
    ogTitle: 'My Collection | Parampara',
    ogImage: OG_IMAGE
  },
  'karnataka.html': {
    title: 'Karnataka GI Crafts — Bidriware, Channapatna Toys & More | Parampara',
    description: 'Explore Karnataka\'s 9 GI-tagged crafts — Bidriware silver inlay, Channapatna lacquered toys, Mysore Silk, Kasuti embroidery, and Sandalwood carvings.',
    ogTitle: 'Karnataka Heritage Crafts | Parampara',
    ogImage: OG_IMAGE
  },
  'login.html': {
    title: 'Sign In — Collector Portal | Parampara',
    description: 'Sign in or register as a Parampara collector. Access your saved masterpieces, order history, and GI authenticity certificates.',
    ogTitle: 'Collector Sign In | Parampara',
    ogImage: OG_IMAGE
  },
  'maharashtra.html': {
    title: 'Maharashtra GI Crafts — Paithani Silk, Warli Art & More | Parampara',
    description: 'Discover Maharashtra\'s 14 GI-tagged crafts — Paithani silk weaves, Warli tribal paintings, Kolhapuri chappals, Nashik grapes, and Pune Okra.',
    ogTitle: 'Maharashtra Heritage Crafts | Parampara',
    ogImage: OG_IMAGE
  },
  'masterpiece.html': {
    title: 'Heritage Masterpiece — Certified GI Craft Studio | Parampara',
    description: 'Explore a certified GI-tagged heritage masterpiece with artisan lineage, 360° craft narrative, provenance certificate, and high-resolution gallery on Parampara.',
    ogTitle: 'Heritage Masterpiece Studio | Parampara',
    ogImage: OG_IMAGE
  },
  'product-jaipur-pottery.html': {
    title: 'Jaipur Blue Pottery — Padma Shri Gopal Saini Artisan Dossier | Parampara',
    description: 'The story of Jaipur Blue Pottery: 800 years of Persian craft heritage, quartz mineral glaze techniques, and Padma Shri Gopal Saini\'s family lineage.',
    ogTitle: 'Jaipur Blue Pottery Artisan Dossier | Parampara',
    ogImage: OG_IMAGE
  },
  'profile.html': {
    title: 'My Profile — Collector Account | Parampara',
    description: 'Manage your Parampara collector profile, order history, and saved heritage masterpieces.',
    ogTitle: 'Collector Profile | Parampara',
    ogImage: OG_IMAGE
  },
  'register.html': {
    title: 'Register — Join Parampara as a Collector',
    description: 'Create your Parampara collector account to save masterpieces, track orders, and receive GI authenticity certificates.',
    ogTitle: 'Register | Parampara Heritage Marketplace',
    ogImage: OG_IMAGE
  },
  'saathi.html': {
    title: 'Saathi AI — Your Cultural Heritage Docent | Parampara',
    description: 'Chat with Saathi — Parampara\'s domain-grounded AI cultural docent. Discover craft histories, authenticate GI tags, and explore artisan economic impact.',
    ogTitle: 'Saathi Cultural AI | Parampara',
    ogImage: OG_IMAGE
  },
  'search.html': {
    title: 'Search Heritage Crafts — Filter by State, Category & Price | Parampara',
    description: 'Search Parampara\'s catalog of 71 GI-tagged Indian crafts. Filter by state, craft category, and price range to find your perfect authenticated heritage piece.',
    ogTitle: 'Search Crafts | Parampara Heritage Marketplace',
    ogImage: OG_IMAGE
  },
  'states.html': {
    title: 'All 28 Indian States — Regional Craft Heritage Directory | Parampara',
    description: 'Explore GI-tagged craft traditions across all 28 Indian states, grouped by North, South, West, Central, and Northeast regions.',
    ogTitle: '28 Indian States Craft Directory | Parampara',
    ogImage: OG_IMAGE
  },
  'state_categories.html': {
    title: 'State Craft Categories — Regional Heritage Map | Parampara',
    description: 'Browse India\'s GI craft categories state by state. Discover textiles, metalwork, pottery, paintings, woodcraft, and more through Parampara\'s interactive heritage map.',
    ogTitle: 'State Craft Categories | Parampara',
    ogImage: OG_IMAGE
  }
};

const ROOT = path.join(__dirname, '..');
let fixed = 0;
let skipped = 0;
let errors = [];

for (const [filename, meta] of Object.entries(PAGE_META)) {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠  SKIP (not found): ${filename}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filepath, 'utf8');

  // Skip if og:title already injected by this script
  if (html.includes('og:title') && html.includes('og:description')) {
    console.log(`✓  SKIP (already has OG tags): ${filename}`);
    skipped++;
    continue;
  }

  const seoBlock = `
  <!-- SEO & Open Graph — injected by GSD Phase 2 -->
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${meta.ogTitle}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:image" content="${meta.ogImage}">
  <meta property="og:url" content="${BASE_URL}/${filename === 'index.html' ? '' : filename}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.ogTitle}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${meta.ogImage}">
  <!-- /SEO -->`;

  // Remove any stale bare <title> tags first
  html = html.replace(/<title>[^<]*<\/title>/gi, '');

  // Inject after <head> or <meta charset...>
  if (html.includes('<meta charset')) {
    html = html.replace(/(<meta charset[^>]*>)/i, `$1${seoBlock}`);
  } else if (html.includes('<head>')) {
    html = html.replace(/<head>/i, `<head>${seoBlock}`);
  } else {
    errors.push(`${filename}: no <head> or <meta charset> found`);
    continue;
  }

  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✅ FIXED: ${filename}`);
  fixed++;
}

console.log(`\n📊 Results: ${fixed} fixed, ${skipped} skipped, ${errors.length} errors`);
if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(e => console.log(`  ❌ ${e}`));
}
