const fs = require('fs');
const path = require('path');

const chhattisgarhItems = [
  {
    id: "cg-dokra-bull-01",
    title: "Bastar Lost-Wax Dokra Metal Brass Bull & Tribal Figurine",
    name: "Bastar Lost-Wax Dokra Metal Brass Bull & Tribal Figurine",
    state: "Chhattisgarh",
    category: "Metal Crafts",
    craft: "Lost-Wax Brass Casting",
    giTag: "GI/RS/110/2008",
    giNumber: "GI/RS/110/2008",
    originHub: "Bastar & Kondagaon",
    district: "Bastar",
    artisan: "Budhilal Dewangan & Bastar Dokra Artisans Guild",
    price: 14500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    description: "4,000-year-old non-ferrous lost-wax casting (Cire Perdue) technique using beeswax, riverbed clay, and molten brass. Every figurine is a one-of-a-kind original.",
    registrationYear: 2008,
    artisanCount: 8500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-champa-kosa-saree-02",
    title: "Champa Pure Wild Kosa Tussar Silk Handloom Saree",
    name: "Champa Pure Wild Kosa Tussar Silk Handloom Saree",
    state: "Chhattisgarh",
    category: "Textiles & Weaves",
    craft: "Kosa Silk Weaving",
    giTag: "GI/RS/395/2013",
    giNumber: "GI/RS/395/2013",
    originHub: "Champa (Janjgir-Champa)",
    district: "Janjgir-Champa",
    artisan: "Chhattisgarh Handloom Weavers Apex Coop Federation",
    price: 12800,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Woven from wild Antheraea mylitta silkworm cocoons harvested in Sal forests. Known for rich golden texture, high breathability, and natural thermal insulation.",
    registrationYear: 2013,
    artisanCount: 18000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-bastar-wood-03",
    title: "Bastar Tribal Hand-Carved Teakwood Deity Panel & Mask",
    name: "Bastar Tribal Hand-Carved Teakwood Deity Panel & Mask",
    state: "Chhattisgarh",
    category: "Wooden Crafts",
    craft: "Bastar Wood Craft",
    giTag: "GI/RS/111/2008",
    giNumber: "GI/RS/111/2008",
    originHub: "Jagdalpur, Bastar",
    district: "Bastar",
    artisan: "Bastar Tribal Woodcarvers Association",
    price: 6500,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    description: "Carved from seasoned indigenous teakwood (Sagwan) depicting forest guardians, tribal dancers, and nature deities using traditional gouges and chisels.",
    registrationYear: 2008,
    artisanCount: 3200,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-loha-shilp-04",
    title: "Bastar Hand-Wrought Iron (Loha Shilp) Tribal Horned Musician",
    name: "Bastar Hand-Wrought Iron (Loha Shilp) Tribal Horned Musician",
    state: "Chhattisgarh",
    category: "Metal Crafts",
    craft: "Loha Shilp (Iron Craft)",
    giTag: "GI/RS/112/2008",
    giNumber: "GI/RS/112/2008",
    originHub: "Kondagaon & Narayanpur",
    district: "Kondagaon",
    artisan: "Lohar Tribal Craftsmen Guild",
    price: 3800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    description: "Recycled scrap iron heated in charcoal furnace and hand-hammered without solder joints to shape graceful elongated tribal figures playing folk drums (Mandar).",
    registrationYear: 2008,
    artisanCount: 2800,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-terracotta-05",
    title: "Kondagaon Terracotta Tribal Elephant Shrine Statue",
    name: "Kondagaon Terracotta Tribal Elephant Shrine Statue",
    state: "Chhattisgarh",
    category: "Pottery & Ceramics",
    craft: "Bastar Terracotta",
    giTag: "GI/CG/TERRACOTTA/05",
    giNumber: "GI/CG/TERRACOTTA/05",
    originHub: "Kondagaon",
    district: "Kondagaon",
    artisan: "Kumbrhar Potter Artisans Society",
    price: 2900,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    description: "Hand-turned hollow terracotta votive figures decorated with clay beads and incised motifs, traditionally offered to forest deities (Devkota).",
    registrationYear: 2012,
    artisanCount: 1900,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-godna-paint-06",
    title: "Surguja Tribal Godna Tattoo Motif Handloom Wall Scroll",
    name: "Surguja Tribal Godna Tattoo Motif Handloom Wall Scroll",
    state: "Chhattisgarh",
    category: "Traditional Paintings",
    craft: "Godna Painting",
    giTag: "GI/CG/GODNA/06",
    giNumber: "GI/CG/GODNA/06",
    originHub: "Ambikapur & Surguja",
    district: "Surguja",
    artisan: "Surguja Women Tribal Painters Collective",
    price: 4500,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    description: "Ancient tribal body tattoo symbols transferred onto coarse tussar cotton canvas using natural tree-bark dyes, katha, and soot ink.",
    registrationYear: 2015,
    artisanCount: 1400,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-tussar-stole-07",
    title: "Wild Forest Kosa Tussar Silk Handloom Dupatta",
    name: "Wild Forest Kosa Tussar Silk Handloom Dupatta",
    state: "Chhattisgarh",
    category: "Textiles & Weaves",
    craft: "Kosa Handloom",
    giTag: "GI/CG/TUSSAR/07",
    giNumber: "GI/CG/TUSSAR/07",
    originHub: "Raigarh & Bilaspur",
    district: "Raigarh",
    artisan: "Bunkar Sahakari Samiti Raigarh",
    price: 3200,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    description: "Unbleached natural honey-gold tussar silk stole with hand-spun slub texture and tribal border stripes.",
    registrationYear: 2014,
    artisanCount: 4500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "cg-sisal-decor-08",
    title: "Bastar Natural Sisal Fiber Braided Tribal Wall Tapestry",
    name: "Bastar Natural Sisal Fiber Braided Tribal Wall Tapestry",
    state: "Chhattisgarh",
    category: "Natural Products & Wellness",
    craft: "Sisal Fiber Craft",
    giTag: "GI/CG/SISAL/08",
    giNumber: "GI/CG/SISAL/08",
    originHub: "Jagdalpur",
    district: "Bastar",
    artisan: "Bastar Tribal Craft Promotion Centre",
    price: 1850,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
    description: "Eco-friendly sisal hemp fiber extracted from agave plants, hand-dyed with vegetable colors and woven into decorative folk tapestries.",
    registrationYear: 2016,
    artisanCount: 1100,
    giTagged: true,
    exportEligible: true
  }
];

// Save Chhattisgarh products to data/chhattisgarh-products.json
fs.writeFileSync(
  path.join(__dirname, '../data/chhattisgarh-products.json'),
  JSON.stringify(chhattisgarhItems, null, 2),
  'utf-8'
);

// Load gi-database.json
const giDbPath = path.join(__dirname, '../backend/data/gi-database.json');
let giDb = JSON.parse(fs.readFileSync(giDbPath, 'utf-8'));

// Filter out old Chhattisgarh items to update with full 8 items
giDb = giDb.filter(item => item.state !== 'Chhattisgarh');
chhattisgarhItems.forEach(item => giDb.push(item));

fs.writeFileSync(giDbPath, JSON.stringify(giDb, null, 2), 'utf-8');

console.log(`Successfully generated Chhattisgarh items and updated gi-database.json (Total items: ${giDb.length})!`);
