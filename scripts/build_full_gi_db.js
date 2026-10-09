const fs = require('fs');
const path = require('path');

// 1. Himachal Pradesh Items
const himachalItems = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/himachal-products.json'), 'utf-8'));

// 2. Maharashtra Items
const maharashtraItems = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/maharashtra-products.json'), 'utf-8'));

// 3. Karnataka Items
const karnatakaItems = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/karnataka-products.json'), 'utf-8'));

// 4. Rajasthan Famous Items
const rajasthanItems = [
  {
    id: "rj-blue-pottery-01",
    title: "Azure Floral Blue Pottery Vase of Jaipur",
    name: "Azure Floral Blue Pottery Vase of Jaipur",
    state: "Rajasthan",
    category: "Pottery & Ceramics",
    craft: "Quartz Pottery",
    giTag: "GI/RS/080/2016",
    giNumber: "GI/RS/080/2016",
    originHub: "Jaipur, Rajasthan",
    district: "Jaipur",
    artisan: "Kripal Kumbh / Gopal Saini (National Awardee)",
    price: 3400,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    description: "Handcrafted using a non-clay paste of ground quartz, raw glaze, sodium sulphate, and gum. Hand-painted with traditional cobalt blue and green oxide floral arabesques.",
    registrationYear: 2016,
    artisanCount: 4500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "rj-meenakari-02",
    title: "Royal Jaipur 24K Gold Plated Meenakari Choker Set",
    name: "Royal Jaipur 24K Gold Plated Meenakari Choker Set",
    state: "Rajasthan",
    category: "Jewelry & Ornaments",
    craft: "Enamel Jewelry",
    giTag: "GI/RS/120/2020",
    giNumber: "GI/RS/120/2020",
    originHub: "Jaipur, Rajasthan",
    district: "Jaipur",
    artisan: "Kudrat Singh Meenakar Family Guild",
    price: 18500,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
    description: "Intricate Persian-style enameling fused onto engraved metal surfaces using ruby reds, emerald greens, and turquoise blues, adorned with pearls and kundan stones.",
    registrationYear: 2020,
    artisanCount: 9500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "rj-sanganer-print-03",
    title: "Sanganeri Hand Block Printed Pure Cotton Mulmul Dupatta",
    name: "Sanganeri Hand Block Printed Pure Cotton Mulmul Dupatta",
    state: "Rajasthan",
    category: "Textiles & Weaves",
    craft: "Block Printing",
    giTag: "GI/RS/150/2022",
    giNumber: "GI/RS/150/2022",
    originHub: "Sanganer (Jaipur), Rajasthan",
    district: "Jaipur",
    artisan: "Sanganer Hand Printers Association",
    price: 1650,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Delicate hand-carved teak wood block prints rendered on airy white cotton mulmul, featuring royal floral sprays (bel & bootis) in natural vegetable dyes.",
    registrationYear: 2022,
    artisanCount: 8000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "rj-jodhpuri-mojari-04",
    title: "Jodhpuri Royal Embroidered Camel Leather Mojari",
    name: "Jodhpuri Royal Embroidered Camel Leather Mojari",
    state: "Rajasthan",
    category: "Leather Craft & Footwear",
    craft: "Hand-stitched Footwear",
    giTag: "GI/RS/052/2013",
    giNumber: "GI/RS/052/2013",
    originHub: "Jodhpur, Rajasthan",
    district: "Jodhpur",
    artisan: "Jodhpur Mochi Guild & Craftsmen",
    price: 2200,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80",
    description: "Handcrafted soft camel leather footwear stitched with brass tilla threads and fine needlework. Features classic curved toe tip (naal) without iron nails.",
    registrationYear: 2013,
    artisanCount: 7500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "rj-kota-doria-05",
    title: "Kota Doria Pure Silk Zari Check Light Saree",
    name: "Kota Doria Pure Silk Zari Check Light Saree",
    state: "Rajasthan",
    category: "Textiles & Weaves",
    craft: "Khat Weaving",
    giTag: "GI/RS/028/2005",
    giNumber: "GI/RS/028/2005",
    originHub: "Kaithoon (Kota), Rajasthan",
    district: "Kota",
    artisan: "Kota Doria Bunkar Sansthan",
    price: 6800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    description: "Translucent featherweight saree woven with cotton and silk yarns using onion-juice sizing to form 300+ signature square grid check patterns (Khats) per border.",
    registrationYear: 2005,
    artisanCount: 14000,
    giTagged: true,
    exportEligible: true
  }
];

// 5. Jammu & Kashmir Famous Items
const jkItems = [
  {
    id: "jk-pashmina-01",
    title: "Hand-Spun Kashmiri Pashmina Sozni Needlework Shawl",
    name: "Hand-Spun Kashmiri Pashmina Sozni Needlework Shawl",
    state: "Jammu and Kashmir",
    category: "Textiles & Weaves",
    craft: "Pashmina Weaving",
    giTag: "GI/RS/079/2008",
    giNumber: "GI/RS/079/2008",
    originHub: "Srinagar, Jammu & Kashmir",
    district: "Srinagar",
    artisan: "Kashmir Pashmina Artisans Forum & Ghulam Hassan",
    price: 28500,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    description: "Woven from 12-micron grade Changthangi goat underfleece hand-spun on wooden charkhas. Embellished with fine Sozni needlework that is identical on both faces.",
    registrationYear: 2008,
    artisanCount: 35000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "jk-walnut-wood-02",
    title: "Hand-Carved Kashmiri Walnut Wood Chinar Wall Plaque",
    name: "Hand-Carved Kashmiri Walnut Wood Chinar Wall Plaque",
    state: "Jammu and Kashmir",
    category: "Wooden Crafts",
    craft: "Walnut Wood Carving",
    giTag: "GI/RS/081/2009",
    giNumber: "GI/RS/081/2009",
    originHub: "Srinagar & Anantnag, Jammu & Kashmir",
    district: "Srinagar",
    artisan: "Tariq Ahmad Woodcraft Guild",
    price: 8400,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    description: "Relief carving executed on seasoned root-wood of Juglans regia (English Walnut), detailing graceful floating Chinar leaves, dragon motifs, and lattice jali work.",
    registrationYear: 2009,
    artisanCount: 8200,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "jk-papier-mache-03",
    title: "Kashmiri Gold-Foil Hand-Painted Papier-Mâché Samovar Box",
    name: "Kashmiri Gold-Foil Hand-Painted Papier-Mâché Samovar Box",
    state: "Jammu and Kashmir",
    category: "Folk Art & Collectibles",
    craft: "Naqashi Papier-Mâché",
    giTag: "GI/RS/082/2009",
    giNumber: "GI/RS/082/2009",
    originHub: "Srinagar, Jammu & Kashmir",
    district: "Srinagar",
    artisan: "Sakhta & Naqash Guild of Kashmir",
    price: 4500,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80",
    description: "Molded paper pulp cured and coated with gypsum plaster, hand-painted with fine cat-hair brushes using pure mineral colors and 24K gold foil illumination (Hazara motif).",
    registrationYear: 2009,
    artisanCount: 4500,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "jk-saffron-04",
    title: "Pampore Grade-A Kashmiri Organic Mongra Saffron (5g)",
    name: "Pampore Grade-A Kashmiri Organic Mongra Saffron (5g)",
    state: "Jammu and Kashmir",
    category: "Agricultural & Spices",
    craft: "Saffron Cultivation",
    giTag: "GI/RS/638/2020",
    giNumber: "GI/RS/638/2020",
    originHub: "Pampore (Pulwama), Jammu & Kashmir",
    district: "Pulwama",
    artisan: "Pampore Saffron Farmers Cooperative",
    price: 2450,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1509358271058-acd05cc93228?auto=format&fit=crop&w=900&q=80",
    description: "World famous deep crimson stigmas of Crocus sativus harvested exclusively from the lacustrine karewa soils of Pampore. Highest crocin (color) and safranal (aroma) content globally.",
    registrationYear: 2020,
    artisanCount: 16000,
    giTagged: true,
    exportEligible: true
  }
];

// 6. Tamil Nadu Famous Items
const tnItems = [
  {
    id: "tn-kanchipuram-01",
    title: "Kanchipuram Temple Gold Zari Mulberry Silk Saree",
    name: "Kanchipuram Temple Gold Zari Mulberry Silk Saree",
    state: "Tamil Nadu",
    category: "Textiles & Weaves",
    craft: "Kanchipuram Silk Weaving",
    giTag: "GI/RS/004/2005",
    giNumber: "GI/RS/004/2005",
    originHub: "Kanchipuram, Tamil Nadu",
    district: "Kanchipuram",
    artisan: "Kanchi Kamakshi Silk Weavers Federation",
    price: 32000,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Woven using 3 ply heavy mulberry silk with silver-copper zari dipped in 24K gold. Features Korvai interlocking warp-weft technique attaching contrast borders securely.",
    registrationYear: 2005,
    artisanCount: 45000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "tn-thanjavur-painting-02",
    title: "Thanjavur 24K Gold Foil Framed Lord Ganesha Artwork",
    name: "Thanjavur 24K Gold Foil Framed Lord Ganesha Artwork",
    state: "Tamil Nadu",
    category: "Traditional Paintings",
    craft: "Tanjore Gold Painting",
    giTag: "GI/RS/115/2009",
    giNumber: "GI/RS/115/2009",
    originHub: "Thanjavur, Tamil Nadu",
    district: "Thanjavur",
    artisan: "Thanjavur Iconography & Painting Guild",
    price: 16500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    description: "Classical 16th-century Chola-Nayak style art on teakwood board featuring raised gesso relief (makku), embedded with Jaipur un-cut glass gems and 24K gold foil leafing.",
    registrationYear: 2009,
    artisanCount: 6800,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "tn-swamimalai-bronze-03",
    title: "Swamimalai Lost-Wax Chola Bronze Nataraja Icon",
    name: "Swamimalai Lost-Wax Chola Bronze Nataraja Icon",
    state: "Tamil Nadu",
    category: "Metal Crafts & Sculpture",
    craft: "Lost-Wax Bronze Casting",
    giTag: "GI/RS/134/2008",
    giNumber: "GI/RS/134/2008",
    originHub: "Swamimalai (Thanjavur), Tamil Nadu",
    district: "Thanjavur",
    artisan: "Stapati Heritage Bronze Artisans Guild",
    price: 24500,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    description: "Cast using ancient Shilpa Shastra proportions from Panchaloha (5 metal alloy) using clay from the banks of the Cauvery river, preserving 1,000-year-old imperial Chola traditions.",
    registrationYear: 2008,
    artisanCount: 3200,
    giTagged: true,
    exportEligible: true
  }
];

// 7. Uttar Pradesh Famous Items
const upItems = [
  {
    id: "up-banarasi-saree-01",
    title: "Banarasi Pure Katan Silk Gold Brocade Saree",
    name: "Banarasi Pure Katan Silk Gold Brocade Saree",
    state: "Uttar Pradesh",
    category: "Textiles & Weaves",
    craft: "Banarasi Brocade",
    giTag: "GI/RS/099/2009",
    giNumber: "GI/RS/099/2009",
    originHub: "Varanasi, Uttar Pradesh",
    district: "Varanasi",
    artisan: "Mustafa Ahmed / Bunkar Sahakari Samiti",
    price: 26500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Woven on jacquard handlooms with pure twisted mulberry Katan silk yarns and zari threads, depicting floral jaal, floral bel, and Mughal minakari motifs.",
    registrationYear: 2009,
    artisanCount: 150000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "up-chikankari-02",
    title: "Lucknow Hand-Embroidered Pure Cotton Chikankari Kurta",
    name: "Lucknow Hand-Embroidered Pure Cotton Chikankari Kurta",
    state: "Uttar Pradesh",
    category: "Embroidery",
    craft: "Shadow Embroidery",
    giTag: "GI/RS/075/2008",
    giNumber: "GI/RS/075/2008",
    originHub: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    artisan: "Lucknow Artisan Women Craft Collective",
    price: 3800,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
    description: "Finest delicate white-on-white needlework featuring 32 distinct stitch types including Tepchi, Bakhiya (shadow stitch), and Phanda (millet knots) on fine cambric cotton.",
    registrationYear: 2008,
    artisanCount: 250000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "up-kannauj-attar-03",
    title: "Kannauj Traditional Mitti Attar (Baked Earth Perfume 12ml)",
    name: "Kannauj Traditional Mitti Attar (Baked Earth Perfume 12ml)",
    state: "Uttar Pradesh",
    category: "Natural Products & Wellness",
    craft: "Hydro-Distillation (Deg-Bhapka)",
    giTag: "GI/RS/142/2014",
    giNumber: "GI/RS/142/2014",
    originHub: "Kannauj, Uttar Pradesh",
    district: "Kannauj",
    artisan: "Kannauj Perfumers Association",
    price: 2100,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80",
    description: "The essence of first rain on sun-baked Gangetic clay captured in sandalwood oil using copper stills (Degs) through a 400-year-old hydro-distillation process without alcohol.",
    registrationYear: 2014,
    artisanCount: 18000,
    giTagged: true,
    exportEligible: true
  }
];

// Combine all datasets
const allCatalog = [
  ...himachalItems,
  ...maharashtraItems,
  ...karnatakaItems,
  ...rajasthanItems,
  ...jkItems,
  ...tnItems,
  ...upItems
];

// Write updated combined catalog into backend/data/gi-database.json
fs.writeFileSync(
  path.join(__dirname, '../backend/data/gi-database.json'),
  JSON.stringify(allCatalog, null, 2),
  'utf-8'
);

// Also write state-specific files in data/
fs.writeFileSync(path.join(__dirname, '../data/rajasthan-products.json'), JSON.stringify(rajasthanItems, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, '../data/jammu-and-kashmir-products.json'), JSON.stringify(jkItems, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, '../data/tamil-nadu-products.json'), JSON.stringify(tnItems, null, 2), 'utf-8');
fs.writeFileSync(path.join(__dirname, '../data/uttar-pradesh-products.json'), JSON.stringify(upItems, null, 2), 'utf-8');

console.log(`Successfully compiled ${allCatalog.length} items across all states into backend/data/gi-database.json and individual data/*.json files!`);
