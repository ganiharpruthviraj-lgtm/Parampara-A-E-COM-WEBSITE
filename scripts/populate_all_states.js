const fs = require('fs');
const path = require('path');

const additionalStatesData = [
  // West Bengal
  {
    id: "wb-darjeeling-tea-01",
    name: "Darjeeling Organic First Flush Single Estate Black Tea (250g)",
    title: "Darjeeling Organic First Flush Single Estate Black Tea (250g)",
    state: "West Bengal",
    category: "Beverages & Natural Products",
    craft: "Himalayan Orthodox Tea",
    giTag: "GI/RS/001/2004",
    giNumber: "GI/RS/001/2004",
    originHub: "Darjeeling Hills",
    district: "Darjeeling",
    artisan: "Darjeeling Tea Planters Association",
    price: 2400,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
    description: "The 'Champagne of Teas', harvested at 2,000m altitude in spring. Renowned globally for delicate muscatel flavor profile and golden amber cup.",
    registrationYear: 2004,
    artisanCount: 55000,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "wb-baluchari-saree-02",
    name: "Baluchari Pure Silk Mythological Pallu Saree",
    title: "Baluchari Pure Silk Mythological Pallu Saree",
    state: "West Bengal",
    category: "Textiles & Weaves",
    craft: "Baluchari Weaving",
    giTag: "GI/RS/135/2011",
    giNumber: "GI/RS/135/2011",
    originHub: "Bishnupur (Bankura)",
    district: "Bankura",
    artisan: "Bishnupur Baluchari Weavers Guild",
    price: 18500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Royal 18th-century jacquard silk saree featuring intricately woven narrative panels on the pallu depicting Ramayana and Mahabharata court scenes.",
    registrationYear: 2011,
    artisanCount: 4200,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "wb-santiniketan-leather-03",
    name: "Santiniketan Hand-Embossed Leather Sling Bag",
    title: "Santiniketan Hand-Embossed Leather Sling Bag",
    state: "West Bengal",
    category: "Leather Craft & Footwear",
    craft: "Santiniketan Leatherwork",
    giTag: "GI/RS/076/2008",
    giNumber: "GI/RS/076/2008",
    originHub: "Bolpur (Santiniketan)",
    district: "Birbhum",
    artisan: "Amar Kutir Leather Artisan Cooperative",
    price: 2850,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    description: "Handcrafted vegetable-tanned goat leather embossed with batik patterns and touch-dyed with natural pigments, pioneered by Rabindranath Tagore's circle.",
    registrationYear: 2008,
    artisanCount: 6500,
    giTagged: true,
    exportEligible: true
  },
  
  // Odisha
  {
    id: "or-pattachitra-01",
    name: "Raghurajpur Palm-Leaf Hand-Engraved Pattachitra Scroll",
    title: "Raghurajpur Palm-Leaf Hand-Engraved Pattachitra Scroll",
    state: "Odisha",
    category: "Traditional Paintings",
    craft: "Palm Leaf Engraving (Talapatra)",
    giTag: "GI/RS/022/2008",
    giNumber: "GI/RS/022/2008",
    originHub: "Raghurajpur Heritage Crafts Village",
    district: "Puri",
    artisan: "Bhaskar Mohapatra & Raghurajpur Chitrakars",
    price: 14500,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    description: "Dried palm leaves stitched with thread, etched using an iron stylus (Lekhani) and rubbed with lampblack tempera to reveal Jagannath and Krishna legends.",
    registrationYear: 2008,
    artisanCount: 2400,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "or-sambalpuri-ikat-02",
    name: "Sambalpuri Bandha Pure Handloom Silk Double Ikat Saree",
    title: "Sambalpuri Bandha Pure Handloom Silk Double Ikat Saree",
    state: "Odisha",
    category: "Textiles & Weaves",
    craft: "Resist Tie-and-Dye Weaving",
    giTag: "GI/RS/170/2023",
    giNumber: "GI/RS/170/2023",
    originHub: "Sambalpur & Bargarh",
    district: "Sambalpur",
    artisan: "Sambalpuri Bastralaya Handloom Cooperative",
    price: 16800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    description: "Traditional tie-dye ikat weaving featuring symbolic shell (Sankha), wheel (Chakra), and floral motifs woven seamlessly using native mulberry silk yarn.",
    registrationYear: 2023,
    artisanCount: 65000,
    giTagged: true,
    exportEligible: true
  },

  // Kerala
  {
    id: "kl-aranmula-kannadi-01",
    name: "Aranmula Hand-Polished Metal Alloy Sacred Mirror",
    title: "Aranmula Hand-Polished Metal Alloy Sacred Mirror",
    state: "Kerala",
    category: "Metal Crafts & Sculpture",
    craft: "Metal Mirror Casting",
    giTag: "GI/RS/002/2005",
    giNumber: "GI/RS/002/2005",
    originHub: "Aranmula",
    district: "Pathanamthitta",
    artisan: "Aranmula Viswabrahmana Heritage Family Guild",
    price: 18900,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    description: "A secret copper-tin alloy front-surface reflection mirror made without silver glass backing. Polished for weeks with velvet cloth and jute ash.",
    registrationYear: 2005,
    artisanCount: 150,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "kl-balaramapuram-saree-02",
    name: "Balaramapuram Pure Fine Cotton Gold Kasavu Saree",
    title: "Balaramapuram Pure Fine Cotton Gold Kasavu Saree",
    state: "Kerala",
    category: "Textiles & Weaves",
    craft: "Kasavu Handloom Weaving",
    giTag: "GI/RS/113/2009",
    giNumber: "GI/RS/113/2009",
    originHub: "Balaramapuram",
    district: "Thiruvananthapuram",
    artisan: "Balaramapuram Handloom Producer Society",
    price: 4800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Unbleached natural cream cotton handwoven with pure metallic zari borders, producing the signature traditional attire of Kerala ceremonies.",
    registrationYear: 2009,
    artisanCount: 12000,
    giTagged: true,
    exportEligible: true
  },

  // Gujarat
  {
    id: "gj-patan-patola-01",
    name: "Patan Patola Royal Double Ikat Pure Silk Saree",
    title: "Patan Patola Royal Double Ikat Pure Silk Saree",
    state: "Gujarat",
    category: "Textiles & Weaves",
    craft: "Double Ikat Weaving",
    giTag: "GI/RS/213/2013",
    giNumber: "GI/RS/213/2013",
    originHub: "Patan",
    district: "Patan",
    artisan: "Salvi Master Weavers Family (Patolawala)",
    price: 85000,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "One of the most complex textiles on earth. Warp and weft threads are individually tie-dyed prior to weaving to create perfectly matching geometric motifs identical on both sides.",
    registrationYear: 2013,
    artisanCount: 40,
    giTagged: true,
    exportEligible: true
  },
  {
    id: "gj-kutch-embroidery-02",
    name: "Rabari Kutch Tribal Hand Mirror-Work Tapestry",
    title: "Rabari Kutch Tribal Hand Mirror-Work Tapestry",
    state: "Gujarat",
    category: "Embroidery",
    craft: "Abhla Mirror Stitching",
    giTag: "GI/RS/095/2017",
    giNumber: "GI/RS/095/2017",
    originHub: "Bhuj & Kutch Desert",
    district: "Kutch",
    artisan: "Shrujan & Kutch Mahila Vikas Sangathan",
    price: 6400,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
    description: "Nomadic Rabari tribal needlework incorporating tiny hand-cut mirrors (Abhla) bound with dense chain-stitch embroidery in vivid silk threads.",
    registrationYear: 2017,
    artisanCount: 20000,
    giTagged: true,
    exportEligible: true
  },

  // Assam
  {
    id: "as-muga-silk-01",
    name: "Assam Pure Natural Golden Muga Silk Mekhela Chador",
    title: "Assam Pure Natural Golden Muga Silk Mekhela Chador",
    state: "Assam",
    category: "Textiles & Weaves",
    craft: "Muga Silk Weaving",
    giTag: "GI/RS/038/2007",
    giNumber: "GI/RS/038/2007",
    originHub: "Sualkuchi (Kamrup)",
    district: "Kamrup",
    artisan: "Sualkuchi Silk Weavers Cooperative",
    price: 36000,
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Endemic to the Assam valley, Muga silk is the world's rarest natural golden silk. Resplendent natural sheen that grows brighter with every hand wash.",
    registrationYear: 2007,
    artisanCount: 85000,
    giTagged: true,
    exportEligible: true
  },

  // Bihar
  {
    id: "br-madhubani-01",
    name: "Mithila Madhubani Hand-Painted Tree of Life Canvas",
    title: "Mithila Madhubani Hand-Painted Tree of Life Canvas",
    state: "Bihar",
    category: "Traditional Paintings",
    craft: "Madhubani Folk Painting",
    giTag: "GI/RS/084/2007",
    giNumber: "GI/RS/084/2007",
    originHub: "Madhubani & Ranti",
    district: "Madhubani",
    artisan: "Baua Devi (Padma Shri) & Mithila Women Collective",
    price: 7800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    description: "Traditional Mithila wall art drawn using fine bamboo twigs and nibs with organic plant dyes and cowdung slip on handmade paper.",
    registrationYear: 2007,
    artisanCount: 32000,
    giTagged: true,
    exportEligible: true
  },

  // Punjab
  {
    id: "pb-phulkari-01",
    name: "Amritsar Hand-Embroidered Silk Bagh Phulkari Dupatta",
    title: "Amritsar Hand-Embroidered Silk Bagh Phulkari Dupatta",
    state: "Punjab",
    category: "Embroidery",
    craft: "Phulkari Needlework",
    giTag: "GI/RS/145/2011",
    giNumber: "GI/RS/145/2011",
    originHub: "Amritsar & Patiala",
    district: "Amritsar",
    artisan: "Punjab Virasat Craft Guild",
    price: 4900,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
    description: "Vibrant 'Garden of Flowers' darning-stitch needlework created on hand-spun khaddar fabric using untwisted silk floss (pat).",
    registrationYear: 2011,
    artisanCount: 18000,
    giTagged: true,
    exportEligible: true
  },

  // Telangana
  {
    id: "ts-pochampally-ikat-01",
    name: "Pochampally Handloom Pure Silk Geometric Double Ikat Saree",
    title: "Pochampally Handloom Pure Silk Geometric Double Ikat Saree",
    state: "Telangana",
    category: "Textiles & Weaves",
    craft: "Pochampally Ikat",
    giTag: "GI/RS/018/2005",
    giNumber: "GI/RS/018/2005",
    originHub: "Bhoodan Pochampally (Yadadri Bhuvanagiri)",
    district: "Yadadri Bhuvanagiri",
    artisan: "Pochampally Handloom Weavers Sahakari Sangam",
    price: 14500,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    description: "UNWTO recognized craft heritage. Features precise mathematical alignment of resist-dyed warp and weft silk yarns before loom weaving.",
    registrationYear: 2005,
    artisanCount: 22000,
    giTagged: true,
    exportEligible: true
  },

  // Andhra Pradesh
  {
    id: "ap-kondapalli-toys-01",
    name: "Kondapalli Hand-Carved Softwood Village Musician Set",
    title: "Kondapalli Hand-Carved Softwood Village Musician Set",
    state: "Andhra Pradesh",
    category: "Wooden Craft & Toys",
    craft: "Kondapalli Toys",
    giTag: "GI/RS/035/2007",
    giNumber: "GI/RS/035/2007",
    originHub: "Kondapalli (NTR District)",
    district: "NTR District",
    artisan: "Kondapalli Toy Artisans Mutual Aid Coop",
    price: 1850,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    description: "Carved from lightweight white softwood (Tella Poniki) and joined with tamarind seed paste, painted with vegetable watercolors.",
    registrationYear: 2007,
    artisanCount: 1200,
    giTagged: true,
    exportEligible: true
  },

  // Madhya Pradesh
  {
    id: "mp-chanderi-saree-01",
    name: "Chanderi Silk Cotton Gold Zari Tissue Saree",
    title: "Chanderi Silk Cotton Gold Zari Tissue Saree",
    state: "Madhya Pradesh",
    category: "Textiles & Weaves",
    craft: "Chanderi Weaving",
    giTag: "GI/RS/019/2005",
    giNumber: "GI/RS/019/2005",
    originHub: "Chanderi (Ashoknagar)",
    district: "Ashoknagar",
    artisan: "Chanderi Bunkar Vikas Samiti",
    price: 8900,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    description: "Royal 13th-century sheer fabric woven with fine cotton and silk yarns, characterized by gold zari coin (Ashrafi) and peacocks motifs.",
    registrationYear: 2005,
    artisanCount: 28000,
    giTagged: true,
    exportEligible: true
  }
];

// Load existing gi-database.json
const giDbPath = path.join(__dirname, '../backend/data/gi-database.json');
let giDb = JSON.parse(fs.readFileSync(giDbPath, 'utf-8'));

// Filter out duplicates by id
const existingIds = new Set(giDb.map(item => item.id));
additionalStatesData.forEach(item => {
  if (!existingIds.has(item.id)) {
    giDb.push(item);
    existingIds.add(item.id);
  }
});

// Save updated gi-database.json
fs.writeFileSync(giDbPath, JSON.stringify(giDb, null, 2), 'utf-8');

console.log(`Updated backend/data/gi-database.json total items: ${giDb.length}`);
