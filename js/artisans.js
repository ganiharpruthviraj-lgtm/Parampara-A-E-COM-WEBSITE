/**
 * ==============================================================================
 * Parampara (परंपरा) — Master Artisan Directory & Guild Registry
 * File: js/artisans.js
 * ==============================================================================
 * Renders verified master craftspeople, Shilp Gurus, Padma Shri awardees,
 * and registered cooperatives across all 28 states and union territories of India.
 * Implements instant search, regional tabs, state dropdowns, craft category
 * filters, and an interactive Master Dossier inspection modal.
 * ==============================================================================
 */

(function () {
  'use strict';

  // --- Configuration & State ---
  const API_ENDPOINT = (typeof window !== 'undefined' && window.GLOBAL_API_BASE)
    ? `${window.GLOBAL_API_BASE}/artisans`
    : '/api/artisans';

  const state = {
    artisans: [],
    filtered: [],
    currentRegion: 'All',
    currentState: 'All',
    currentCategory: 'All',
    currentAward: 'All',
    searchQuery: '',
    selectedArtisan: null
  };

  // --- Fallback Master Artisans Dataset (Guarantees 100% offline & static resilience) ---
  const EMBEDDED_ARTISANS = [
  {
    "id": "artisan-jk-ghulam-hassan",
    "name": "Ustad Ghulam Hassan & Master Pashmina Forum",
    "honor": "National Awardee & Master Weaver",
    "state": "Jammu and Kashmir",
    "region": "North",
    "district": "Downtown Srinagar",
    "craft": "Pashmina Hand-Spinning & Kani Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/079/2008",
    "experience": "5th Generation Lineage · 40 Years Mastery",
    "bio": "Ustad Ghulam Hassan carries forward the royal tradition of Changthangi raw cashmere spinning on traditional charkhas and delicate Kani wooden needle-tujis, producing wraps with gossamer lightness that once draped the Mughal courts.",
    "materials": "Pure 12-14 micron Changthangi cashmere goat fleece, walnut bark botanical dyes",
    "imageUrl": "assets/artisans/artisan-jk-ghulam-hassan.webp",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "350+ master spinners and weavers",
    "searchQuery": "search.html?q=Pashmina"
  },
  {
    "id": "artisan-jk-tariq-ahmad",
    "name": "Master Tariq Ahmad Woodcraft Guild",
    "honor": "State Master Craftsman",
    "state": "Jammu and Kashmir",
    "region": "North",
    "district": "Srinagar (Safakadal)",
    "craft": "Kashmiri Walnut Wood Carving",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/081/2009",
    "experience": "4th Generation Lineage · 28 Years Mastery",
    "bio": "Master Tariq carves seasoned Kashmiri walnut wood using miniature steel chisels to create deep undercut floral Jali trellises, chinar leaf scrolls, and dragon motifs that require months of patient hand sculpting.",
    "materials": "Naturally seasoned 100-year Juglans regia walnut wood, beeswax burnish",
    "imageUrl": "assets/artisans/artisan-jk-tariq-ahmad.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "42 woodcraft journeymen",
    "searchQuery": "search.html?state=Jammu+and+Kashmir"
  },
  {
    "id": "artisan-hp-bhuttico",
    "name": "Bhuttico Handloom Weavers Cooperative",
    "honor": "National Excellence Award (Est. 1944)",
    "state": "Himachal Pradesh",
    "region": "North",
    "district": "Kullu Valley",
    "craft": "Kullu Shawl Extra-Weft Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/130/2004",
    "experience": "Est. 1944 · 80 Years of Guild Excellence",
    "bio": "Founded in the heart of the Beas River valley, Bhuttico weaves indigenous Australian Merino and Pashmina fibers on wooden pit looms, incorporating sacred Himalayan kaleidoscopic borders (Chhabri and Phool patterns) handed down through generations.",
    "materials": "Australian Merino wool, local Desi sheep wool, eco-reactive organic dyes",
    "imageUrl": "assets/artisans/artisan-hp-bhuttico.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "1,200+ weaver households",
    "searchQuery": "search.html?state=Himachal+Pradesh"
  },
  {
    "id": "artisan-hp-lalita-vakil",
    "name": "Smt. Lalita Vakil & Chamba Craft Guild",
    "honor": "Padma Shri & Shilp Guru Awardee",
    "state": "Himachal Pradesh",
    "region": "North",
    "district": "Chamba",
    "craft": "Chamba Rumal Double-Faced Needlecraft",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/131/2008",
    "experience": "Living Legend · 50+ Years Preservation",
    "bio": "Padma Shri Lalita Vakil revived the forgotten art of Dorukha embroidery, creating unknotted double-sided silk tapestries on unbleached mulmul depicting Pahari miniature court scenes and Raslila that look identical from both sides.",
    "materials": "Handspun unbleached khaddar cotton, untwisted raw silk untwisted floss (Pat)",
    "imageUrl": "assets/artisans/artisan-hp-lalita-vakil.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "120 rural women artisans",
    "searchQuery": "search.html?state=Himachal+Pradesh"
  },
  {
    "id": "artisan-pb-virasat",
    "name": "Punjab Virasat Craft Guild & Bibi Prakash Kaur",
    "honor": "State Heritage Awardee",
    "state": "Punjab",
    "region": "North",
    "district": "Amritsar & Patiala",
    "craft": "Authentic Phulkari Silk-Floss Needlework",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/145/2011",
    "experience": "4th Generation Tradition · 35 Years",
    "bio": "Bibi Prakash Kaur coordinates rural women embroiderers across Majha villages who count threads on coarse, handspun khaddar to execute dense, geometric Baghs using vibrant unspun pat silk floss in golden-yellow and crimson hues.",
    "materials": "Coarse organic handloom khaddar, pure untwisted mulberry silk floss",
    "imageUrl": "assets/artisans/artisan-pb-virasat.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "280 artisan sisters",
    "searchQuery": "search.html?state=Punjab"
  },
  {
    "id": "artisan-pb-thatheras",
    "name": "Thatheras of Jandiala Guru Artisan Guild",
    "honor": "UNESCO Intangible Cultural Heritage Inscribed",
    "state": "Punjab",
    "region": "North",
    "district": "Jandiala Guru, Amritsar",
    "craft": "Traditional Beaten Brass & Copper Vessels",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/580/2019",
    "experience": "Centuries-Old Lineage · UNESCO Recognized",
    "bio": "The Thatheras of Jandiala Guru are the sole Indian metalcraft inscribed on UNESCO's Intangible Cultural Heritage list. They hand-hammer thick copper and brass sheets on sunken anvils to yield luminous indented pots known for Ayurvedic properties.",
    "materials": "Virgin copper and brass alloy, wood-charcoal annealing furnaces, manual hammer forge",
    "imageUrl": "assets/artisans/artisan-pb-thatheras.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "UNESCO & GI Certified Guild",
    "membersCount": "65 master thatheras",
    "searchQuery": "search.html?state=Punjab"
  },
  {
    "id": "artisan-hr-panipat",
    "name": "Panipat Handloom Master Weavers Guild",
    "honor": "National Handloom Award Guild",
    "state": "Haryana",
    "region": "North",
    "district": "Panipat",
    "craft": "Panipat Punja Handloom Durrie Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/240/2015",
    "experience": "3rd Generation Weavers · 30 Years",
    "bio": "Hailing from the historic textile capital of Panipat, these master weavers use heavy iron punjas (hand beaters) on pit looms to lock tightly twisted wool and cotton yarns into reversible floor art with crisp geometric diamonds and floral medallions.",
    "materials": "Indigenous long-staple Indian cotton warp, virgin New Zealand wool weft",
    "imageUrl": "assets/artisans/artisan-hr-panipat.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "410 loom operators",
    "searchQuery": "search.html?state=Haryana"
  },
  {
    "id": "artisan-uk-aipan",
    "name": "Kumaon Aipan Women Cooperative",
    "honor": "State Heritage Conservation Guild",
    "state": "Uttarakhand",
    "region": "North",
    "district": "Almora",
    "craft": "Kumaoni Aipan Ritual Folk Painting",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/655/2021",
    "experience": "Centuries-Old Himalayan Tradition",
    "bio": "The women of Kumaon create holy Aipan geometric floor and wall paintings using consecrated red clay (Geru) washed across the threshold and pure fermented rice flour paste (Biswar) applied with the delicate tips of their ring fingers.",
    "materials": "Natural red mountain clay (Geru), organic ground rice paste (Biswar), sacred ochres",
    "imageUrl": "assets/artisans/artisan-uk-aipan.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "150 mountain women artists",
    "searchQuery": "search.html?state=Uttarakhand"
  },
  {
    "id": "artisan-uk-bhotiya",
    "name": "Bhotiya Tribal Woolen Artisans Association",
    "honor": "Tribal Master Guild",
    "state": "Uttarakhand",
    "region": "North",
    "district": "Pithoragarh (Dharchula)",
    "craft": "Bhotiya Dan & Thulma Heavy Blanket Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/656/2021",
    "experience": "Trans-Himalayan Lineage · 38 Years",
    "bio": "Living in the high alpine valleys of Uttarakhand, the Bhotiya tribe cleanses and cards high-altitude mountain sheep fleece by hand, weaving thick pile carpets and insulating blankets adorned with Tibetan Buddhist endless-knot motifs.",
    "materials": "Hand-carded Gaddi and Bhotiya mountain fleece, walnut root and madder root dyes",
    "imageUrl": "assets/artisans/artisan-uk-bhotiya.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Tribal Guild",
    "membersCount": "190 high-altitude pastoral weavers",
    "searchQuery": "search.html?state=Uttarakhand"
  },
  {
    "id": "artisan-up-banaras",
    "name": "Ustad Mustafa Ahmed / Varanasi Bunkar Sahakari Samiti",
    "honor": "President's Medalist & National Master",
    "state": "Uttar Pradesh",
    "region": "North",
    "district": "Varanasi (Madanpura)",
    "craft": "Banarasi Katan Silk & Kadwa Brocade",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/099/2009",
    "experience": "6th Generation Lineage · 42 Years Mastery",
    "bio": "Ustad Mustafa Ahmed represents centuries of royal Varanasi weaving. Using traditional drawlooms and the labor-intensive Kadwa (floating needle) technique, he hand-locks genuine 24-karat silver and gold dipped zari threads into pure mulberry silk.",
    "materials": "Pure mulberry Katan silk, electroplated silver-gilt zari thread, natural silk warping",
    "imageUrl": "assets/artisans/artisan-up-banaras.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "600+ pit loom master weavers",
    "searchQuery": "search.html?q=Banarasi"
  },
  {
    "id": "artisan-up-lucknow",
    "name": "Lucknow Artisan Women Craft Collective",
    "honor": "National Handloom & Handicrafts Award",
    "state": "Uttar Pradesh",
    "region": "North",
    "district": "Lucknow (Chowk)",
    "craft": "Chikankari White-on-White Shadow Embroidery",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/075/2008",
    "experience": "Awadh Royal Tradition · 32 Years",
    "bio": "Preserving the delicate Mughal court craft initiated by Empress Noor Jahan, this collective features master artisans adept at 36 distinct stitch types, including Tepchi, Bakhiya (shadow work), Phanda, and Jali window stitching on translucent mulmul.",
    "materials": "Fine gossamer muslin and georgette, untwisted pure cotton stitching threads",
    "imageUrl": "assets/artisans/artisan-up-lucknow.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Collective",
    "membersCount": "850 rural needlecraftswomen",
    "searchQuery": "search.html?state=Uttar+Pradesh"
  },
  {
    "id": "artisan-up-kannauj",
    "name": "Kannauj Traditional Perfumers Guild",
    "honor": "Living Heritage Perfumery House",
    "state": "Uttar Pradesh",
    "region": "North",
    "district": "Kannauj",
    "craft": "Deg-Bhapka Hydro-Distilled Mitti & Rose Attar",
    "category": "Heritage Adornments & Perfumery",
    "giTag": "GI/RS/142/2014",
    "experience": "8th Generation Lineage · 400 Years Tradition",
    "bio": "Operating in the perfume capital of India along the Ganges, master perfumers capture the scent of the first monsoon rain hitting dry clay (Mitti Attar) using archaic copper stills (Degs), bamboo condensers (Chonga), and aged Mysore sandalwood base oils.",
    "materials": "Clean Gangetic sun-baked clay, Damask rose petals, pure Santalum album sandalwood oil",
    "imageUrl": "assets/artisans/artisan-up-kannauj.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "45 copper still distillers",
    "searchQuery": "search.html?state=Uttar+Pradesh"
  },
  {
    "id": "artisan-ka-quadri",
    "name": "Shah Rasheed Ahmed Quadri & Bidar Craftsmen Guild",
    "honor": "Padma Shri & Shilp Guru Awardee",
    "state": "Karnataka",
    "region": "South",
    "district": "Bidar",
    "craft": "Bidriware Silver Inlay on Blackened Alloy",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/015/2006",
    "experience": "Living Legend · 45 Years Mastery",
    "bio": "Padma Shri Shah Rasheed Ahmed Quadri is India's most celebrated master of Bidriware. He casts zinc and copper alloys, engraves intricate floral Arabesques, inlays pure silver sheets with jeweler's chisels, and permanently darkens the body using soil from the 15th-century Bidar Fort.",
    "materials": "Zinc-copper base alloy, 99.9% fine silver wire and foil, sacred Bidar Fort soil",
    "imageUrl": "assets/artisans/artisan-ka-quadri.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "75 master engravers",
    "searchQuery": "search.html?state=Karnataka"
  },
  {
    "id": "artisan-ka-channapatna",
    "name": "C. Bharat & Channapatna Traditional Craftsmen",
    "honor": "State Master Craftsman",
    "state": "Karnataka",
    "region": "South",
    "district": "Channapatna, Ramanagara",
    "craft": "Channapatna Ivory-Wood Lacquered Toys",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/014/2006",
    "experience": "4th Generation Lineage · 26 Years Mastery",
    "bio": "Working in India's 'Gombegala Ooru' (Toy Town), Master Bharat turns soft Wrightia tinctoria (Aale Mara) timber on electric and manual lathes, burnishing non-toxic vegetable-colored lac (using turmeric, kumkum, and indigo) with dry screw-pine leaves.",
    "materials": "Sustainable Wrightia tinctoria (Ivory Wood), natural tree lac, vegetable dyes",
    "imageUrl": "assets/artisans/artisan-ka-channapatna.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "320 lathe turners",
    "searchQuery": "search.html?state=Karnataka"
  },
  {
    "id": "artisan-ka-kinhal",
    "name": "Kinhal Chitragar Lineage (D.V. Chitragar & Family)",
    "honor": "National Heritage Awardee",
    "state": "Karnataka",
    "region": "South",
    "district": "Kinhal, Koppal",
    "craft": "Kinhal Sacred Wooden Sculpture & Toys",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/186/2012",
    "experience": "Vijayanagara Royal Lineage · 400 Years",
    "bio": "Descendants of artists who decorated the famous Virupaksha temple at Hampi, the Chitragar family crafts deities and cradle toys using lightweight Ponki wood glued with an ancient concoction of tamarind seed paste and jute fibers (Kitta).",
    "materials": "Lightweight Polki wood, jute fiber and tamarind paste (Kitta), natural gold leaf",
    "imageUrl": "assets/artisans/artisan-ka-kinhal.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "35 master woodcarvers",
    "searchQuery": "search.html?state=Karnataka"
  },
  {
    "id": "artisan-ka-mysuru-inlay",
    "name": "Shaukat Ali & Mysuru Rosewood Inlay Guild",
    "honor": "National Awardee & Master Artisan",
    "state": "Karnataka",
    "region": "South",
    "district": "Mysuru",
    "craft": "Mysuru Rosewood Marquetry & Inlay",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/025/2005",
    "experience": "5th Generation Inlay Master · 36 Years",
    "bio": "Patronized by the Wadiyar Maharajas of Mysore, Shaukat Ali cuts and embeds naturally colored woods (rubber wood, jackfruit, white cedar) into solid Indian rosewood panels, portraying Dasara processions and mythological panels without artificial paints.",
    "materials": "Seasoned Dalbergia latifolia Indian rosewood, naturally tinted forest woods, brass pins",
    "imageUrl": "assets/artisans/artisan-ka-mysuru-inlay.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "80 master marquetry artists",
    "searchQuery": "search.html?state=Karnataka"
  },
  {
    "id": "artisan-tn-kanchi",
    "name": "Kanchi Kamakshi Silk Weavers Federation",
    "honor": "President of India Gold Medallist Guild",
    "state": "Tamil Nadu",
    "region": "South",
    "district": "Kanchipuram",
    "craft": "Kanchipuram Pure Mulberry Silk & Korvai Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/004/2005",
    "experience": "Centuries-Old Temple Tradition · 50 Years",
    "bio": "Woven according to the strict traditions of Sage Markandeya (the master weaver of the Gods), Kanchipuram sarees utilize heavy 3-ply mulberry silk, interlocking the body and border via the Korvai technique and weaving sacred temple motifs with silver-electroplated pure gold zari.",
    "materials": "3-ply heavy mulberry silk, pure silver-wrapped silk core zari, South Indian temple motifs",
    "imageUrl": "assets/artisans/artisan-tn-kanchi.webp",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Federation",
    "membersCount": "2,400+ master loom weavers",
    "searchQuery": "search.html?q=Kanchipuram"
  },
  {
    "id": "artisan-tn-thanjavur",
    "name": "Thanjavur Iconography & Painting Guild",
    "honor": "National Master Craftsman Guild",
    "state": "Tamil Nadu",
    "region": "South",
    "district": "Thanjavur",
    "craft": "Thanjavur 22K Gold Foil Painting",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/115/2009",
    "experience": "Chola-Maratha Lineage · 38 Years",
    "bio": "Originating in the 16th century under the Maratha rulers of Tanjore, this guild crafts devotional panels on seasoned jackwood boards coated with limestone gesso (Sukka), embedding Jaipur semi-precious stones and pressing sheets of pure 22K gold foil.",
    "materials": "Seasoned teakwood plank, Arabic gum limestone gesso, 22-karat pure gold foil, semi-precious cabochons",
    "imageUrl": "assets/artisans/artisan-tn-thanjavur.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "110 iconographers",
    "searchQuery": "search.html?state=Tamil+Nadu"
  },
  {
    "id": "artisan-tn-stapati",
    "name": "Stapati Heritage Bronze Artisans Guild",
    "honor": "Shilp Guru & Chola Traditional Bronze Guild",
    "state": "Tamil Nadu",
    "region": "South",
    "district": "Swamimalai, Thanjavur",
    "craft": "Swamimalai Lost-Wax Chola Bronze Casting",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/134/2008",
    "experience": "8th Generation Royal Stapati Lineage",
    "bio": "Tracing their genealogy to the imperial sculptors of Raja Raja Chola who built the Brihadeeswarar Temple, these stapatis craft Nataraja icons strictly following the proportions of the Shilpa Shastras using the Madhuchishtavidhana lost-wax process.",
    "materials": "Panchaloha alloy (copper, zinc, lead, silver, gold traces), Cauvery river fine silt clay, wild beeswax",
    "imageUrl": "assets/artisans/artisan-tn-stapati.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "50 traditional stapatis",
    "searchQuery": "search.html?state=Tamil+Nadu"
  },
  {
    "id": "artisan-kl-aranmula",
    "name": "Aranmula Viswabrahmana Heritage Family Guild",
    "honor": "National Heritage Living Legend Guild",
    "state": "Kerala",
    "region": "South",
    "district": "Aranmula, Pathanamthitta",
    "craft": "Aranmula Metal Mirror (Kannadi) Casting",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/002/2004",
    "experience": "8 Families Exclusive Custodians · 500 Years",
    "bio": "Crafted exclusively by a closely knit guild of Vishwakarma families in Aranmula, this front-surface reflection mirror is made not of glass, but of a secretive, resonant copper-tin alloy polished by hand over 45 days with velvet and marrow oil to achieve optical perfection.",
    "materials": "Secret metallurgical copper-tin speculum alloy, Aranmula clay mold, velvet burnishing",
    "imageUrl": "assets/artisans/artisan-kl-aranmula.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Heritage Custodians",
    "membersCount": "25 master mirror casters",
    "searchQuery": "search.html?state=Kerala"
  },
  {
    "id": "artisan-kl-balaramapuram",
    "name": "Balaramapuram Handloom Producer Society",
    "honor": "Travancore Royal Heritage Weavers",
    "state": "Kerala",
    "region": "South",
    "district": "Balaramapuram, Thiruvananthapuram",
    "craft": "Balaramapuram Kasavu Fine Cotton Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/140/2009",
    "experience": "Royal Travancore Guild · 200 Years",
    "bio": "Brought by the Maharaja of Travancore over two centuries ago, Balaramapuram master weavers produce super-fine 100-count to 120-count unbleached cream cotton Mundus and sarees with pure gold zari borders woven with wooden throw-shuttle pit looms.",
    "materials": "100s combed long-staple organic cotton, 24K gold dipped silver zari ribbon",
    "imageUrl": "assets/artisans/artisan-kl-balaramapuram.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "750 traditional weavers",
    "searchQuery": "search.html?state=Kerala"
  },
  {
    "id": "artisan-ap-kondapalli",
    "name": "Kondapalli Toy Artisans Mutual Aid Coop",
    "honor": "State Master Craftsmen Cooperative",
    "state": "Andhra Pradesh",
    "region": "South",
    "district": "Kondapalli, NTR District",
    "craft": "Kondapalli Hand-Carved Softwood Toys",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/035/2007",
    "experience": "400-Year Aryakshatriya Tradition",
    "bio": "Carved from indigenous Tella Poniki (white softwood) found in the Kondapalli hills, each toy is individually sculpted with miniature curved chisels, assembled with tamarind paste, and painted with oil-based and natural vegetable pigments depicting rural village folklore.",
    "materials": "Lightweight Tella Poniki (Givotia rottleriformis) wood, tamarind seed glue, mineral paints",
    "imageUrl": "assets/artisans/artisan-ap-kondapalli.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "140 master toymakers",
    "searchQuery": "search.html?state=Andhra+Pradesh"
  },
  {
    "id": "artisan-ap-kalamkari",
    "name": "Master Pitchuka Srinivas & Machilipatnam Kalamkari Guild",
    "honor": "National Awardee & UNESCO Heritage Master",
    "state": "Andhra Pradesh",
    "region": "South",
    "district": "Machilipatnam, Krishna District",
    "craft": "Machilipatnam Vegetable-Dye Block Print Kalamkari",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/019/2005",
    "experience": "5th Generation Kalamkari Master · 34 Years",
    "bio": "Carrying forward the ancient maritime craft of Golconda and Machilipatnam, Master Pitchuka uses hand-carved teakwood blocks and organic botanical mordants (myrobalan, alum, madder root, fermented iron jaggery) to produce timeless tree-of-life wall hangings.",
    "materials": "Organic unbleached cambric cotton, fermented iron and jaggery black ink, natural vegetable dyes",
    "imageUrl": "assets/artisans/artisan-ap-kalamkari.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "95 block carvers and printers",
    "searchQuery": "search.html?state=Andhra+Pradesh"
  },
  {
    "id": "artisan-ts-pochampally",
    "name": "Pochampally Handloom Weavers Sahakari Sangam",
    "honor": "UNESCO Best Tourism Village Heritage Guild",
    "state": "Telangana",
    "region": "South",
    "district": "Bhuvanagiri (Pochampally)",
    "craft": "Pochampally Pagdu Bandhu (Double Ikat)",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/018/2005",
    "experience": "Centuries-Old Ikat Lineage · 45 Years",
    "bio": "Pochampally weavers calculate complex geometric designs directly on the warp and weft yarns, tie-dyeing them with natural and safe vat colors before loading the loom. The resulting fabric features soft, hazy diamond transitions characteristic of world-class double ikat.",
    "materials": "Pure mulberry silk, combed fine cotton yarns, water-resistant rubber-tied resist dyeing",
    "imageUrl": "assets/artisans/artisan-ts-pochampally.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "1,100+ master ikat weavers",
    "searchQuery": "search.html?state=Telangana"
  },
  {
    "id": "artisan-ts-cheriyal",
    "name": "Shri D. Vaikuntam & Cheriyal Nakashi Artists",
    "honor": "National Awardee & Master Scroll Painter",
    "state": "Telangana",
    "region": "South",
    "district": "Cheriyal, Siddipet",
    "craft": "Cheriyal Folk Scroll Painting & Dolls",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/070/2007",
    "experience": "6th Generation Nakashi Lineage · 48 Years",
    "bio": "Master D. Vaikuntam is the primary custodian of Telangana's Cheriyal scroll paintings, historically used by traveling bards. He paints narrative mythological panels on khadi cloth treated with tamarind paste and white mud using squirrels' hair brushes and ground mineral stones.",
    "materials": "Khadi canvas treated with tree gum and chalk, ground mineral stones, squirrel hair brushes",
    "imageUrl": "assets/artisans/artisan-ts-cheriyal.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "18 master scroll artists",
    "searchQuery": "search.html?state=Telangana"
  },
  {
    "id": "artisan-rj-gopal-saini",
    "name": "Shri Gopal Saini & Kripal Kumbh Studio",
    "honor": "Shilp Guru & National Awardee",
    "state": "Rajasthan",
    "region": "West",
    "district": "Jaipur",
    "craft": "Jaipur Glazed Quartz Blue Pottery",
    "category": "Pottery & Ceramics",
    "giTag": "GI/RS/080/2016",
    "experience": "4th Generation Master · 36 Years Mastery",
    "bio": "Trained under the legendary Kripal Singh Shekhawat, Shilp Guru Gopal Saini creates lead-free Egyptian paste pottery that uses zero clay. Hand-ground quartz stone, raw glass, Fuller's earth, and katira gum are low-fired once to produce jewel-toned cobalt vases exhibited in global museums.",
    "materials": "Crushed quartz stone, natural glass, Multani mitti, Persian blue cobalt oxides",
    "imageUrl": "assets/artisans/artisan-rj-gopal-saini.webp",
    "craftImageUrl": "assets/products/blue_pottery_vase.webp",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "Shilp Guru Certified Studio",
    "membersCount": "60+ studio potters and decorators",
    "searchQuery": "search.html?q=Jaipur+Blue+Pottery"
  },
  {
    "id": "artisan-rj-meenakari",
    "name": "Kudrat Singh Meenakar Family Guild",
    "honor": "President's Gold Medal & National Awardee",
    "state": "Rajasthan",
    "region": "West",
    "district": "Jaipur (Johari Bazaar)",
    "craft": "Jaipur Royal 24K Gold Meenakari Enamelling",
    "category": "Heritage Adornments & Perfumery",
    "giTag": "GI/RS/120/2020",
    "experience": "Descendant of Raja Man Singh's 16th-Century Court Enamellers",
    "bio": "Direct descendants of master enamellers summoned from Lahore to Amer in the 16th century, the Kudrat Singh family engraves fine channels into 24-karat gold ornaments, fusing delicate crushed vitreous glass colors in sequential firings to yield lustrous royal jewelry.",
    "materials": "Pure 24-karat hallmark yellow gold, crushed silicate mineral enamels, natural seed pearls",
    "imageUrl": "assets/artisans/artisan-rj-meenakari.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "28 master enamellers",
    "searchQuery": "search.html?state=Rajasthan"
  },
  {
    "id": "artisan-rj-sanganer",
    "name": "Sanganer Hand Printers Association",
    "honor": "State Heritage Guild Award",
    "state": "Rajasthan",
    "region": "West",
    "district": "Sanganer, Jaipur",
    "craft": "Sanganeri Hand-Block Calico Printing",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/150/2022",
    "experience": "500-Year Chippa Community Lineage",
    "bio": "The Chippas of Sanganer print delicate floral butis, bel trellises, and rosettes on fine white and pastel cotton grounds using carved sheesham blocks. The local river water properties fix bright madder reds and syahi blacks with astonishing permanence.",
    "materials": "Hand-carved sheesham wood blocks, organic alum and vegetable mordants, fine cambric cotton",
    "imageUrl": "assets/artisans/artisan-rj-sanganer.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Association",
    "membersCount": "450 block printing families",
    "searchQuery": "search.html?state=Rajasthan"
  },
  {
    "id": "artisan-gj-patola",
    "name": "Salvi Master Weavers Family (Patolawala)",
    "honor": "Padma Shri & National Heritage Awardees",
    "state": "Gujarat",
    "region": "West",
    "district": "Patan",
    "craft": "Patan Patola Pure Silk Double Ikat",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/213/2013",
    "experience": "28 Generations Exclusive Lineage · 900 Years",
    "bio": "The Salvi family is one of only three families on Earth that retain the sacred art of Patan Double Ikat. Both the warp and weft silk yarns are individually tied and dyed before weaving on a slanting rosewood loom. Each masterpiece requires 6 months to a year to complete.",
    "materials": "Mulberry natural silk yarns, 100% natural madder, indigo, marigold and turmeric dyes",
    "imageUrl": "assets/artisans/artisan-gj-patola.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Lineage",
    "membersCount": "12 master lineage weavers",
    "searchQuery": "search.html?state=Gujarat"
  },
  {
    "id": "artisan-gj-shrujan",
    "name": "Shrujan & Kutch Mahila Vikas Sangathan",
    "honor": "UNESCO Heritage Recognition & National Award",
    "state": "Gujarat",
    "region": "West",
    "district": "Kutch (Bhuj)",
    "craft": "Kutch Abhla Needlework & Mirror Stitching",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/095/2017",
    "experience": "Pastoral Tribal Heritage · 50 Years Organization",
    "bio": "Uniting women across 12 distinct ethnic communities (Rabari, Ahir, Meghwal, Mutwa), Shrujan preserves 16 authentic tribal embroidery styles, embedding tiny blown-glass mirrors (Abhla) with tight silk buttonhole and herringbone stitches.",
    "materials": "Handloom cotton and mashru silk, hand-cut convex mirror glass, silk embroidery floss",
    "imageUrl": "assets/artisans/artisan-gj-shrujan.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Collective",
    "membersCount": "3,500+ rural artisan women",
    "searchQuery": "search.html?state=Gujarat"
  },
  {
    "id": "artisan-mh-paithani",
    "name": "Yeola Paithani Bunkar Sahakari Sanstha",
    "honor": "National Handloom Award Guild",
    "state": "Maharashtra",
    "region": "West",
    "district": "Yeola, Nashik",
    "craft": "Paithani Royal Silk Saree Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/027/2006",
    "experience": "Maratha Peshwa Heritage · 40 Years",
    "bio": "Known as the 'Queen of Sarees', Paithani uses the ancient tapestry weaving technique without any mechanical jacquard. The weaver manually interlocks colored silk wefts to craft iridescent peacocks (Mor), parrots (Popat), and kaleidoscopic borders dipped in gold zari.",
    "materials": "Filature mulberry silk, real gold-dipped silver zari, vegetable dyes",
    "imageUrl": "assets/artisans/artisan-mh-paithani.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "820 traditional handloom weavers",
    "searchQuery": "search.html?state=Maharashtra"
  },
  {
    "id": "artisan-mh-warli",
    "name": "Warli Adivasi Vikas Sanstha (Jivya Soma Mashe Guild)",
    "honor": "Padma Shri Custodian Guild",
    "state": "Maharashtra",
    "region": "West",
    "district": "Jawhar & Dahanu, Palghar",
    "craft": "Warli Tribal Sacred Mud & Rice Painting",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/172/2014",
    "experience": "Neolithic Roots · 3000-Year Continuous Tradition",
    "bio": "Trained under the late Padma Shri Jivya Soma Mashe, this indigenous tribal guild uses simple geometric circles (representing the sun and moon), triangles (mountains and trees), and lines to convey sacred agrarian rituals, the Tarpa dance, and mother nature's harmony.",
    "materials": "Cow dung and red mud plastered canvas, fermented ground rice paste, chewed bamboo twig brushes",
    "imageUrl": "assets/artisans/artisan-mh-warli.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Tribal Guild",
    "membersCount": "135 adivasi painters",
    "searchQuery": "search.html?state=Maharashtra"
  },
  {
    "id": "artisan-mh-kolhapuri",
    "name": "Sant Rohidas Leather Craftsmen Cooperative",
    "honor": "State Heritage Guild",
    "state": "Maharashtra",
    "region": "West",
    "district": "Kolhapur",
    "craft": "Authentic Hand-Stitched Kolhapuri Chappals",
    "category": "Heritage Adornments & Perfumery",
    "giTag": "GI/RS/242/2019",
    "experience": "Chhatrapati Shahu Maharaj Royal Heritage",
    "bio": "Handcrafted using vegetable-tanned buffalo and goat leather without a single nail or chemical adhesive. The sole is stitched entirely with natural agave fiber (Sisall) and vegetable-tanned thongs, producing footwear famed for durability and thermal cooling.",
    "materials": "Vegetable-tanned unadulterated leather (babul bark tanning), hand-braided agave fibers",
    "imageUrl": "assets/artisans/artisan-mh-kolhapuri.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "380 master cobbler artisans",
    "searchQuery": "search.html?state=Maharashtra"
  },
  {
    "id": "artisan-ga-bicholim",
    "name": "Bicholim Earthen Potters Cooperative Guild",
    "honor": "Goa State Heritage Awardee",
    "state": "Goa",
    "region": "West",
    "district": "Bicholim, North Goa",
    "craft": "Traditional Goan Terracotta Art & Mask Craft",
    "category": "Pottery & Ceramics",
    "giTag": "GI/RS/633/2020",
    "experience": "3rd Generation Guild · 32 Years",
    "bio": "Working with the distinctive iron-rich alluvial red clay along Goa's inland waterways, Bicholim potters sculpt expressive theatrical masks, garden urns, and decorative roof finials finished with smoke reduction firings and beeswax glazes.",
    "materials": "Native Bicholim red clay, natural wood-ash glazes, pit kilns",
    "imageUrl": "assets/artisans/artisan-ga-bicholim.webp",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "48 studio potters",
    "searchQuery": "search.html?state=Goa"
  },
  {
    "id": "artisan-wb-baluchari",
    "name": "Bishnupur Baluchari Weavers Guild",
    "honor": "National Awardee & Malla Heritage Weavers",
    "state": "West Bengal",
    "region": "East",
    "district": "Bishnupur, Bankura",
    "craft": "Baluchari & Swarnachari Silk Brocade",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/135/2011",
    "experience": "Malla Dynasty Royal Tradition · 35 Years",
    "bio": "Originating in Murshidabad and flourished under the Malla kings of Bishnupur, Baluchari weavers weave narrative scenes from the Ramayana, Mahabharata, and royal courtly life across the saree pallu using intricate multi-colored silk and gold jacquard brocades.",
    "materials": "Pure Murshidabad mulberry silk, gold electroplated silver zari, eco-friendly dye baths",
    "imageUrl": "assets/artisans/artisan-wb-baluchari.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "420 master loom artisans",
    "searchQuery": "search.html?state=West+Bengal"
  },
  {
    "id": "artisan-wb-amarkutir",
    "name": "Amar Kutir Leather Artisan Cooperative",
    "honor": "Tagore Heritage Foundation Award",
    "state": "West Bengal",
    "region": "East",
    "district": "Santiniketan, Birbhum",
    "craft": "Santiniketan Embossed Leathercraft",
    "category": "Heritage Adornments & Perfumery",
    "giTag": "GI/RS/076/2008",
    "experience": "Founded with Rabindranath Tagore's Vision · 80 Years",
    "bio": "Pioneered in the rural ashram of Rabindranath Tagore at Santiniketan, master artisans engrave natural vegetable-tanned sheep and goat skins with batik wax and hand-press metal dies to produce soft, embossed leather portfolios, bags, and journals.",
    "materials": "Vegetable-tanned sheepskin, natural batik wax, non-toxic touch colors",
    "imageUrl": "assets/artisans/artisan-wb-amarkutir.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "350 rural craftswomen and men",
    "searchQuery": "search.html?state=West+Bengal"
  },
  {
    "id": "artisan-od-pattachitra",
    "name": "Master Bhaskar Mohapatra & Raghurajpur Chitrakars",
    "honor": "National Awardee & Heritage Crafts Village",
    "state": "Odisha",
    "region": "East",
    "district": "Raghurajpur Heritage Village, Puri",
    "craft": "Pattachitra Palm Leaf Engraving & Silk Scrolls",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/022/2008",
    "experience": "7th Generation Chitrakar Lineage · 42 Years",
    "bio": "Living in the world-famous artisan heritage village of Raghurajpur, Master Bhaskar Mohapatra prepares hand-treated dried palm leaves (Tala Patra) and handspun tussar cloth treated with chalk and tamarind gum, using fine iron styluses to etch epics of Lord Jagannath.",
    "materials": "Seasoned Tala palm leaves, conch shell white pigment, lamp soot black, natural mineral vermilion",
    "imageUrl": "assets/artisans/artisan-od-pattachitra.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "120 village chitrakars",
    "searchQuery": "search.html?q=Pattachitra"
  },
  {
    "id": "artisan-od-sambalpuri",
    "name": "Sambalpuri Bastralaya Handloom Cooperative",
    "honor": "National Awardee & Apex Cooperative (Est. 1954)",
    "state": "Odisha",
    "region": "East",
    "district": "Bargarh & Sambalpur",
    "craft": "Sambalpuri Bandha (Weft-Warp Ikat) Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/170/2023",
    "experience": "70 Years of Weaving Cooperative Leadership",
    "bio": "Founded under the visionary leadership of Padmashree Krutartha Acharya, Sambalpuri Bastralaya empowers indigenous Bhulia master weavers who tie-and-dye intricate motifs of shankha (conch), chakra (wheel), and phula (lotus) into pure cotton and tussar silks.",
    "materials": "Handspun combed cotton, pure forest tussar silk, colorfast natural and vat dyes",
    "imageUrl": "assets/artisans/artisan-od-sambalpuri.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "5,000+ weaver households",
    "searchQuery": "search.html?state=Odisha"
  },
  {
    "id": "artisan-br-baua-devi",
    "name": "Smt. Baua Devi & Mithila Women Collective",
    "honor": "Padma Shri & National Awardee",
    "state": "Bihar",
    "region": "East",
    "district": "Jitwarpur, Madhubani",
    "craft": "Madhubani (Mithila) Folk Painting",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/084/2007",
    "experience": "Living Legend · 55 Years Mastery",
    "bio": "Padma Shri Baua Devi is one of the foundational matriarchs of Madhubani art. Painting on handmade paper primed with cow dung wash, she renders complex cosmologies of Krishna, Kohbar fertility symbols, and birds using natural twigs, nibs, and organic plant juices.",
    "materials": "Handmade rag paper washed with cow dung, kajal soot, turmeric yellow, aparajita blue, peepal bark",
    "imageUrl": "assets/artisans/artisan-br-baua-devi.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "Padma Shri Certified Studio",
    "membersCount": "210 Mithila women painters",
    "searchQuery": "search.html?q=Madhubani"
  },
  {
    "id": "artisan-br-bhagalpur",
    "name": "Bhagalpur Silk Weavers Apex Society",
    "honor": "National Heritage Handloom Guild",
    "state": "Bihar",
    "region": "East",
    "district": "Bhagalpur",
    "craft": "Bhagalpur Pure Tussar & Matka Silk",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/094/2008",
    "experience": "Silk City Heritage · Over a Century",
    "bio": "Known globally as India's 'Silk City', Bhagalpur's master weavers harvest wild Antheraea mylitta cocoons from forest trees to produce coarse, textured, breathable tussar and matka silks woven on wooden pit looms with subtle slub textures.",
    "materials": "Wild forest Tussar silk cocoons, natural hand-reeled yarn, organic vegetable dyes",
    "imageUrl": "assets/artisans/artisan-br-bhagalpur.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Society",
    "membersCount": "1,500+ cocoon reelers and weavers",
    "searchQuery": "search.html?state=Bihar"
  },
  {
    "id": "artisan-jh-bulu-imam",
    "name": "Virasat Tribal Women Artists Collective & Bulu Imam",
    "honor": "Padma Shri & Gandhi International Peace Awardee",
    "state": "Jharkhand",
    "region": "East",
    "district": "Hazaribagh",
    "craft": "Sohrai & Khovar Indigenous Mud Mural Painting",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/627/2020",
    "experience": "Indigenous Cave Art Tradition · 30 Years",
    "bio": "Under the mentorship of Padma Shri Bulu Imam, Santhal, Kurmi, and Oraon women celebrate harvest and marriage by painting rhythmic murals on handmade paper using four natural clay earths (dudhi white, lal mati red, pilla mati yellow, kali mati black) applied with broken combs and cloth swabs.",
    "materials": "Natural earth clays (mangan, kaolin, hematite), handspun cloth swabs, bamboo combs",
    "imageUrl": "assets/artisans/artisan-jh-bulu-imam.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Tribal Collective",
    "membersCount": "160 tribal matriarch painters",
    "searchQuery": "search.html?state=Jharkhand"
  },
  {
    "id": "artisan-mp-chanderi",
    "name": "Chanderi Bunkar Vikas Samiti",
    "honor": "National Handloom Award Guild",
    "state": "Madhya Pradesh",
    "region": "Central",
    "district": "Chanderi, Ashoknagar",
    "craft": "Chanderi Silk-Cotton & Zari Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/005/2005",
    "experience": "Bundelkhand Royal Tradition · 4th Generation",
    "bio": "Patronized by the Scindias and Bundela kings, Chanderi weavers interlace pure mulberry silk warp with fine unbleached cotton weft to achieve sheer, featherlight drapery decorated with celestial motifs (Ashrafi, Nalferma) woven with gold and silver zari.",
    "materials": "Extra-fine silk yarn, 100-count cotton, pure zari threads, wooden throw-shuttle looms",
    "imageUrl": "assets/artisans/artisan-mp-chanderi.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Samiti",
    "membersCount": "850 master weavers",
    "searchQuery": "search.html?state=Madhya+Pradesh"
  },
  {
    "id": "artisan-mp-bagh",
    "name": "Master Bilal Khatri & Bagh Print Artisans",
    "honor": "National Awardee & Shilp Guru Lineage",
    "state": "Madhya Pradesh",
    "region": "Central",
    "district": "Bagh, Dhar",
    "craft": "Bagh Natural Dye Hand-Block Printing",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/098/2008",
    "experience": "5th Generation Khatri Lineage · 30 Years",
    "bio": "Master Bilal Khatri continues the lineage of Ismail Sulemanji Khatri on the banks of the Bagh River. Using carved teak blocks, pure copperas (iron rust), and alizarin red, the cloth undergoes repeated washings in the river whose high copper content yields the intense red-black tones unique to Bagh.",
    "materials": "Teakwood blocks, river water, tamarind seed paste, alizarin, pomegranate rinds",
    "imageUrl": "assets/artisans/artisan-mp-bagh.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "115 block printers",
    "searchQuery": "search.html?state=Madhya+Pradesh"
  },
  {
    "id": "artisan-cg-dokra",
    "name": "Budhilal Dewangan & Bastar Dokra Artisans Guild",
    "honor": "National Master Craftsman Guild",
    "state": "Chhattisgarh",
    "region": "Central",
    "district": "Bastar & Kondagaon",
    "craft": "Lost-Wax Bell Metal (Dokra) Casting",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/110/2008",
    "experience": "4,000-Year Ancient Lost-Wax Metallurgy Lineage",
    "bio": "Dating back to the Dancing Girl of Mohenjo-Daro, the Ghadwa tribal metallurgists of Bastar sculpt intricate wax cords over a core of ant-hill clay, encasing it in river silt and molten recycled brass and bell metal in pit hearths to create one-of-a-kind sculptural deities.",
    "materials": "Recycled brass, pure beeswax and dammar tree resin cords, alluvial termite clay",
    "imageUrl": "assets/artisans/artisan-cg-dokra.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "220 tribal bronze casters",
    "searchQuery": "search.html?q=Dokra"
  },
  {
    "id": "artisan-cg-kosa",
    "name": "Chhattisgarh Handloom Weavers Apex Coop Federation",
    "honor": "State Apex Federation Award",
    "state": "Chhattisgarh",
    "region": "Central",
    "district": "Janjgir-Champa",
    "craft": "Champa Pure Wild Kosa Tussar Silk Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/395/2013",
    "experience": "Centuries-Old Forest Tribal Weaving",
    "bio": "Harvested from wild sal trees in the tribal heartland of Bastar and Bilaspur, Kosa silk is reeled by tribal women and handwoven by Dewangan master weavers into thick, golden-hued fabric famed for thermodynamic warmth in winter and cool ventilation in summer.",
    "materials": "Wild forest Kosa cocoons, hand-spun coarse silk yarn, natural botanical dyes",
    "imageUrl": "assets/artisans/artisan-cg-kosa.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Apex Federation",
    "membersCount": "3,800+ tribal reelers and weavers",
    "searchQuery": "search.html?state=Chhattisgarh"
  },
  {
    "id": "artisan-cg-loha",
    "name": "Lohar Tribal Craftsmen Guild",
    "honor": "State Master Craftsmen Society",
    "state": "Chhattisgarh",
    "region": "Central",
    "district": "Kondagaon, Bastar",
    "craft": "Bastar Loha Shilp (Hand-Wrought Iron Craft)",
    "category": "Metalware & Bronze",
    "giTag": "GI/RS/112/2008",
    "experience": "Ancient Iron Smelting Tribal Heritage",
    "bio": "Working with recycled scrap iron sheets and rods, the Lohar ironsmiths heat iron in charcoal kilns, beating it manually with iron hammers on anvils without any welding or molds to craft expressive tribal musicians, candle stands, and deity totems.",
    "materials": "Repurposed wrought iron, coal forge, manual hammer shaping, mustard oil protective polish",
    "imageUrl": "assets/artisans/artisan-cg-loha.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1567591414240-e17926fb966f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "85 master blacksmiths",
    "searchQuery": "search.html?state=Chhattisgarh"
  },
  {
    "id": "artisan-as-sualkuchi",
    "name": "Sualkuchi Silk Weavers Cooperative",
    "honor": "Assam Royal Ahom Heritage Weavers",
    "state": "Assam",
    "region": "North East",
    "district": "Sualkuchi, Kamrup",
    "craft": "Golden Muga Silk Mekhela Chador Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/038/2007",
    "experience": "Manchester of the East · 800-Year Ahom Dynasty Tradition",
    "bio": "Sualkuchi is the sacred sanctuary of Muga—the naturally golden, lustrous wild silk found only in the Brahmaputra Valley. Muga fabric becomes glossier with every wash and outlives its wearer, woven by master weavers into traditional two-piece Mekhela Chador bridal attire.",
    "materials": "100% pure wild golden Muga silk, natural Som tree feed, bamboo throw shuttles",
    "imageUrl": "assets/artisans/artisan-as-sualkuchi.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "2,100+ indigenous Assamese weavers",
    "searchQuery": "search.html?state=Assam"
  },
  {
    "id": "artisan-as-majuli",
    "name": "Shri Hemchandra Goswami & Majuli Mask Making Guild",
    "honor": "Padma Shri & Sangeet Natak Akademi Awardee",
    "state": "Assam",
    "region": "North East",
    "district": "Majuli River Island",
    "craft": "Majuli Traditional Bhaona Mukha (Mask) Craft",
    "category": "Painting & Folk Art",
    "giTag": "GI/RS/728/2022",
    "experience": "Srimanta Sankardev Neo-Vaishnavite Heritage · 500 Years",
    "bio": "Based at the Natun Samaguri Satra on the world's largest river island, Padma Shri Hemchandra Goswami sculpts flexible masks used in traditional Vaishnavite theatrical plays (Bhaona) using indigenous bamboo armatures, river silt, cow dung, and natural Hengul-Haital mineral dyes.",
    "materials": "Assam bamboo (Bhaluka banh), cane, river silt clay, Hengul vermilion and Haital arsenic yellow minerals",
    "imageUrl": "assets/artisans/artisan-as-majuli.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Master Guild",
    "membersCount": "35 master mask sculptors",
    "searchQuery": "search.html?state=Assam"
  },
  {
    "id": "artisan-ar-idumishmi",
    "name": "Idu Mishmi Cultural and Literary Society",
    "honor": "Tribal Indigenous Heritage Guild",
    "state": "Arunachal Pradesh",
    "region": "North East",
    "district": "Lower Dibang Valley (Roing)",
    "craft": "Idu Mishmi Loin-Loom Woolen Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/586/2019",
    "experience": "Centuries-Old Indigenous Loin-Loom Tradition",
    "bio": "Idu Mishmi women weave dramatic black, red, and white geometric jackets and coats on strap-supported loin-looms attached around their waists. Incorporating sting-nettle fibers and cotton, their intricate patterns reflect the mountain topography and totemic animist spirits.",
    "materials": "Hand-harvested wild nettle fiber, indigenous mountain wool, natural bark dye baths",
    "imageUrl": "assets/artisans/artisan-ar-idumishmi.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Tribal Society",
    "membersCount": "95 loin-loom tribal weavers",
    "searchQuery": "search.html?state=Arunachal+Pradesh"
  },
  {
    "id": "artisan-ar-wancho",
    "name": "Wancho Traditional Artisan Cooperative",
    "honor": "State Tribal Master Craft Guild",
    "state": "Arunachal Pradesh",
    "region": "North East",
    "district": "Longding District",
    "craft": "Wancho Tribal Ancestral Wood Carving",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/642/2021",
    "experience": "Ancestral Patrilineal Woodcarving Lineage",
    "bio": "The Wancho craftsmen of Longding carve sacred wooden human figures, warrior statues, and village dormitory pillars from local forest timber using handheld machetes (daos) and gouges, reflecting the heroic ancestral heritage of Eastern Arunachal.",
    "materials": "Wild mountain hardwoods, local soot and mineral pigments, bamboo detailing",
    "imageUrl": "assets/artisans/artisan-ar-wancho.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "40 tribal woodcarvers",
    "searchQuery": "search.html?state=Arunachal+Pradesh"
  },
  {
    "id": "artisan-mn-shaphee",
    "name": "Manipur Apex Handloom Weavers & Handicrafts Cooperative",
    "honor": "Manipur State Apex Handloom Guild",
    "state": "Manipur",
    "region": "North East",
    "district": "Imphal West",
    "craft": "Shaphee Lanphee Royal Shawl Handloom",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/371/2014",
    "experience": "Meitei Royal Court Tradition · 40 Years",
    "bio": "Historically gifted by the Meitei Kings to valorous warriors, the Shaphee Lanphee is a striking black shawl woven on traditional frame looms, hand-embroidered with auspicious celestial symbols: the sun (numit), moon (tha), celestial dragon, and sacred stars.",
    "materials": "Hand-spun pure cotton yarn, natural indigo-and-black dye vats, needlework floss",
    "imageUrl": "assets/artisans/artisan-mn-shaphee.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Apex Society",
    "membersCount": "420 Meitei craftswomen",
    "searchQuery": "search.html?state=Manipur"
  },
  {
    "id": "artisan-mn-kauna",
    "name": "Kauna Artisan Cooperative of Manipur",
    "honor": "State Handicraft Excellence Guild",
    "state": "Manipur",
    "region": "North East",
    "district": "Kakching & Thoubal",
    "craft": "Kauna Water Reed Braiding & Basketry",
    "category": "Natural Fibers & Bamboo",
    "giTag": "GI/RS/690/2021",
    "experience": "Wetland Ecological Craft Heritage · 25 Years",
    "bio": "Harvested from the wetlands of Manipur, the spongy stem of the Kauna water reed (Schoenoplectus lacustris) is sun-cured and braided into biodegradable, water-resistant luxury baskets, yoga mats, and floor cushions prized for their natural aroma.",
    "materials": "100% natural wetland Kauna water reeds, sun-cured without chemical bleaching",
    "imageUrl": "assets/artisans/artisan-mn-kauna.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "380 women reed braiders",
    "searchQuery": "search.html?state=Manipur"
  },
  {
    "id": "artisan-ml-umden",
    "name": "Umden Weavers Association & Meghalaya Silk Board",
    "honor": "Eco-Heritage Village Weaver Society",
    "state": "Meghalaya",
    "region": "North East",
    "district": "Umden, Ri-Bhoi",
    "craft": "Ryndia Eri Peace Silk Organic Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/744/2022",
    "experience": "Khasi Indigenous Peace Silk Heritage",
    "bio": "In Meghalaya's first silk village of Umden, Bhoi weavers harvest Eri silk without boiling the pupae alive, earning it the title 'Ahimsa (Peace) Silk'. Spun manually and dyed exclusively with turmeric, wild madder, and lac, Ryndia wraps possess soft thermal qualities that age beautifully.",
    "materials": "100% non-violent Ahimsa Eri silk, forest lac, wild turmeric, sohkhu plant mordants",
    "imageUrl": "assets/artisans/artisan-ml-umden.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Association",
    "membersCount": "290 Bhoi Khasi weavers",
    "searchQuery": "search.html?state=Meghalaya"
  },
  {
    "id": "artisan-ml-bamboo",
    "name": "Meghalaya Rural Bamboo Guild",
    "honor": "State Indigenous Cane Craft Guild",
    "state": "Meghalaya",
    "region": "North East",
    "district": "East Khasi Hills (Cherrapunji & Pynursla)",
    "craft": "Khasi Split-Bamboo & Cane Basketry",
    "category": "Natural Fibers & Bamboo",
    "giTag": "GI/RS/385/2018",
    "experience": "Cloud Forest Indigenous Living Tradition",
    "bio": "Living in the world's wettest rainfall zones, Khasi artisans split flexible mountain bamboo into paper-thin ribbons, weaving waterproof conical rain-shields (Knup), fish traps, and storage baskets tightly interlaced to resist tropical humidity.",
    "materials": "Sustainable Dendrocalamus strictus mountain bamboo, natural wild cane bark",
    "imageUrl": "assets/artisans/artisan-ml-bamboo.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Guild",
    "membersCount": "175 tribal cane weavers",
    "searchQuery": "search.html?state=Meghalaya"
  },
  {
    "id": "artisan-mz-thenzawl",
    "name": "Thenzawl Handloom Cooperative Society",
    "honor": "Mizoram State Handloom City Guild",
    "state": "Mizoram",
    "region": "North East",
    "district": "Thenzawl, Serchhip",
    "craft": "Mizo Puan Traditional Handloom Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/612/2019",
    "experience": "Centuries-Old Mizo Ancestral Craft",
    "bio": "Thenzawl is the heart of Mizo textile culture. Using waist loin-looms and handlooms, weavers create Puanchei, Ngotekherh, and Tawlhlohpuan with bold horizontal and vertical black-and-white stripes and diamond borders that symbolize nobility and tribal valor.",
    "materials": "High-grade mercerized cotton, traditional natural black and red tree dyes",
    "imageUrl": "assets/artisans/artisan-mz-thenzawl.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Cooperative",
    "membersCount": "480 Mizo handloom weavers",
    "searchQuery": "search.html?state=Mizoram"
  },
  {
    "id": "artisan-nl-chakhesang",
    "name": "Chakhesang Women Welfare Society (CWWS)",
    "honor": "National Tribal Women Empowerment Guild",
    "state": "Nagaland",
    "region": "North East",
    "district": "Pfütsero, Phek",
    "craft": "Chakhesang Naga Traditional Shawl Weaving",
    "category": "Textiles & Weaves",
    "giTag": "GI/RS/542/2017",
    "experience": "Indigenous Naga Heritage · 40 Years Society",
    "bio": "Chakhesang women weave heavy ceremonial shawls on portable backstrap loin looms. Every motif and stripe communicates the wearer's social status, lineage, and connection to nature, using hand-extracted mountain nettle yarn and natural forest madder.",
    "materials": "Wild mountain stinging nettle fiber, handspun cotton, wild madder root red dye",
    "imageUrl": "assets/artisans/artisan-nl-chakhesang.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Society",
    "membersCount": "620 Chakhesang backstrap weavers",
    "searchQuery": "search.html?state=Nagaland"
  },
  {
    "id": "artisan-tr-tribac",
    "name": "Tripura Bamboo and Cane Development Corporation (TRIBAC)",
    "honor": "National Awardee Apex Corporation",
    "state": "Tripura",
    "region": "North East",
    "district": "Agartala, West Tripura",
    "craft": "Tripura Micro-Split Bamboo Window Screens & Furniture",
    "category": "Natural Fibers & Bamboo",
    "giTag": "GI/RS/280/2014",
    "experience": "State Excellence Guild · 30 Years",
    "bio": "Tripura possesses the most refined bamboo splitting techniques in Asia. Master craftspeople shave Muli and Barak bamboos into slivers thinner than paper (micro-splints), weaving flexible window blinds, delicate screens, and tea coasters that resemble fine linen.",
    "materials": "Indigenous Muli bamboo (Melocanna baccifera), natural smoked bamboo varnish",
    "imageUrl": "assets/artisans/artisan-tr-tribac.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified Corporation",
    "membersCount": "540 master bamboo artisans",
    "searchQuery": "search.html?state=Tripura"
  },
  {
    "id": "artisan-sk-directorate",
    "name": "Directorate of Handicrafts & Handloom Sikkim",
    "honor": "Sikkim State Heritage Center (Est. 1957)",
    "state": "Sikkim",
    "region": "North East",
    "district": "Gangtok & Mangan",
    "craft": "Lepcha Handloom Weaving & Tibetan Woodcarving",
    "category": "Woodcraft & Carving",
    "giTag": "GI/RS/730/2022",
    "experience": "Chogyal Royal Kingdom Heritage · 65 Years",
    "bio": "Established during the reign of the Chogyal monarchs, this historic institution preserves indigenous Lepcha backstrap weaving, knot-tied pure sheep wool Tibetan dragon carpets, and intricate hand-carved foldable Choktse tables with Buddhist Ashtamangala symbols.",
    "materials": "Himalayan sheep wool, seasoned Kath wood, mineral pigments, natural lacquer",
    "imageUrl": "assets/artisans/artisan-sk-directorate.jpg",
    "craftImageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    "payoutShare": "70% Direct Guild Payout",
    "verificationStatus": "GI Certified State Center",
    "membersCount": "310 master craftsmen and carpet weavers",
    "searchQuery": "search.html?state=Sikkim"
  }
];

  // --- DOM Elements Cache ---
  const DOM = {};

  function initDOMElements() {
    DOM.grid = document.getElementById('artisans-grid');
    DOM.count = document.getElementById('results-count');
    DOM.searchInput = document.getElementById('artisan-search-input');
    DOM.clearSearchBtn = document.getElementById('clear-search-btn');
    DOM.stateSelect = document.getElementById('state-select-filter');
    DOM.regionFilters = document.getElementById('region-filters');
    DOM.categoryFilters = document.getElementById('category-filters');
    DOM.awardFilters = document.getElementById('award-filters');
    DOM.resetFiltersBtn = document.getElementById('reset-filters-btn');
    DOM.activeFilterSummary = document.getElementById('active-filter-summary');
    DOM.modal = document.getElementById('artisan-dossier-modal');
    DOM.modalBackdrop = document.getElementById('dossier-modal-backdrop');
    DOM.modalContent = document.getElementById('dossier-modal-content');
    DOM.modalCloseBtn = document.getElementById('close-dossier-modal-btn');
    DOM.statArtisansCount = document.getElementById('stat-artisans-count');
    DOM.statStatesCount = document.getElementById('stat-states-count');
  }

  // --- Load Artisans Data ---
  async function fetchArtisans() {
    try {
      // 1. Try local data/artisans.json (instant for local & static deployments)
      const staticRes = await fetch('data/artisans.json');
      if (staticRes.ok) {
        const data = await staticRes.json();
        if (Array.isArray(data) && data.length > 0) {
          state.artisans = data;
          applyFilters();
          populateStateDropdown();
          updateLiveStats();
          return;
        }
      }
    } catch (e) {
      console.warn('Static data/artisans.json fetch failed, falling back to API / cache:', e.message);
    }

    try {
      // 2. Try API endpoint
      const apiRes = await fetch(API_ENDPOINT);
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          state.artisans = json.data;
          applyFilters();
          populateStateDropdown();
          updateLiveStats();
          return;
        }
      }
    } catch (e) {
      console.warn('API /api/artisans fetch failed:', e.message);
    }

    // 3. Fallback to embedded data if fetch failed
    if (EMBEDDED_ARTISANS.length > 0) {
      state.artisans = EMBEDDED_ARTISANS;
      applyFilters();
      populateStateDropdown();
      updateLiveStats();
    }
  }

  // --- Populate State Dropdown ---
  function populateStateDropdown() {
    if (!DOM.stateSelect) return;

    // Get unique sorted states with count
    const stateCounts = {};
    state.artisans.forEach(a => {
      stateCounts[a.state] = (stateCounts[a.state] || 0) + 1;
    });

    const sortedStates = Object.keys(stateCounts).sort();

    // Preserve the first option ("All 28 States & UTs")
    DOM.stateSelect.innerHTML = `<option value="All">All 28 States &amp; UTs (${state.artisans.length} Masters)</option>`;

    sortedStates.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = `${st} (${stateCounts[st]})`;
      if (state.currentState === st) opt.selected = true;
      DOM.stateSelect.appendChild(opt);
    });
  }

  // --- Live Stats Telemetry ---
  function updateLiveStats() {
    const uniqueStates = new Set(state.artisans.map(a => a.state));
    if (DOM.statStatesCount) {
      DOM.statStatesCount.textContent = `${uniqueStates.size}`;
    }
    if (DOM.statArtisansCount) {
      DOM.statArtisansCount.textContent = `${state.artisans.length}+`;
    }
  }

  // --- Award Badge Helper ---
  function getAwardBadge(honor) {
    if (!honor) return '';
    const h = honor.toLowerCase();
    if (h.includes('shilp guru')) {
      return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-900 shadow-sm">
        <i class="fa-solid fa-crown text-amber-600"></i> Shilp Guru
      </span>`;
    }
    if (h.includes('padma shri')) {
      return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/40 text-yellow-900 shadow-sm">
        <i class="fa-solid fa-medal text-yellow-600"></i> Padma Shri
      </span>`;
    }
    if (h.includes('unesco')) {
      return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-900 shadow-sm">
        <i class="fa-solid fa-globe text-blue-600"></i> UNESCO Inscribed
      </span>`;
    }
    if (h.includes('national')) {
      return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-900 shadow-sm">
        <i class="fa-solid fa-award text-purple-600"></i> National Awardee
      </span>`;
    }
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 shadow-sm">
      <i class="fa-solid fa-building-columns text-emerald-600"></i> Heritage Guild
    </span>`;
  }

  // --- Apply Filters ---
  function applyFilters() {
    let list = [...state.artisans];

    // Search query filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.craft.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        (a.giTag && a.giTag.toLowerCase().includes(q)) ||
        (a.honor && a.honor.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
    }

    // Region filter
    if (state.currentRegion !== 'All') {
      list = list.filter(a => a.region === state.currentRegion);
    }

    // State filter
    if (state.currentState !== 'All') {
      list = list.filter(a => a.state === state.currentState);
    }

    // Category filter
    if (state.currentCategory !== 'All') {
      list = list.filter(a => a.category === state.currentCategory);
    }

    // Award filter
    if (state.currentAward !== 'All') {
      const aw = state.currentAward.toLowerCase();
      list = list.filter(a => {
        const h = (a.honor || '').toLowerCase();
        if (aw === 'padma') return h.includes('padma');
        if (aw === 'shilp') return h.includes('shilp');
        if (aw === 'national') return h.includes('national') || h.includes('president');
        if (aw === 'cooperative') return h.includes('cooperative') || h.includes('federation') || h.includes('guild');
        return true;
      });
    }

    state.filtered = list;
    renderArtisansGrid();
    renderFilterSummary();
  }

  // --- Render Filter Summary & Reset Button ---
  function renderFilterSummary() {
    if (DOM.count) {
      const total = state.artisans.length;
      const count = state.filtered.length;
      DOM.count.textContent = `Showing ${count} of ${total} Master Artisans`;
    }

    const hasActiveFilters =
      state.searchQuery ||
      state.currentRegion !== 'All' ||
      state.currentState !== 'All' ||
      state.currentCategory !== 'All' ||
      state.currentAward !== 'All';

    if (DOM.resetFiltersBtn) {
      DOM.resetFiltersBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }

    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    }
  }

  // --- Render Artisans Grid ---
  function renderArtisansGrid() {
    if (!DOM.grid) return;

    if (state.filtered.length === 0) {
      DOM.grid.innerHTML = `
        <div class="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-amber-900/20 shadow-sm max-w-xl mx-auto my-8">
          <div class="w-16 h-16 rounded-full bg-amber-50 text-[#B8860B] flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-compass"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Master Artisans Found</h3>
          <p class="text-sm text-gray-500 mb-6">
            We couldn't find any master artisans matching your current filter criteria.
          </p>
          <button id="empty-state-reset-btn" class="px-5 py-2.5 bg-[#B8860B] text-white rounded-full text-xs font-bold hover:bg-[#800000] transition-colors shadow">
            Reset All Filters
          </button>
        </div>
      `;
      const btn = document.getElementById('empty-state-reset-btn');
      if (btn) btn.addEventListener('click', resetAllFilters);
      return;
    }

    const html = state.filtered.map(artisan => {
      const awardBadge = getAwardBadge(artisan.honor);
      const searchUrl = artisan.searchQuery || `search.html?state=${encodeURIComponent(artisan.state)}`;

      return `
        <div class="artisan-card group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-[#F0EBE1] flex flex-col justify-between" data-id="${artisan.id}">
          <!-- Visual Header -->
          <div class="relative overflow-hidden aspect-[4/3] bg-stone-900">
            <img
              decoding="async"
              loading="lazy"
              alt="${artisan.name}"
              src="${artisan.imageUrl || 'assets/master_potter_artisan.webp'}"
              onerror="this.onerror=null; this.src='assets/parampara_logo_crest.webp';"
              class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <!-- Top Floating Badges -->
            <div class="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                <i class="fa-solid fa-location-dot text-amber-400"></i> ${artisan.district}, ${artisan.state}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                <i class="fa-solid fa-shield-halved text-emerald-400"></i> ${artisan.giTag || 'GI Certified'}
              </span>
            </div>

            <!-- Bottom Floating Craft Title in Image -->
            <div class="absolute bottom-3 left-3 right-3 z-10">
              <div class="mb-1">${awardBadge}</div>
              <p class="text-xs font-semibold tracking-wider text-amber-200 uppercase font-serif">
                ${artisan.craft}
              </p>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[10px] font-bold tracking-widest text-[#B8860B] uppercase">
                  ${artisan.region} India · ${artisan.category}
                </span>
                <span class="text-[10px] text-gray-400 font-medium">
                  ${artisan.experience ? artisan.experience.split('·')[0].trim() : 'Master Lineage'}
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 group-hover:text-[#B8860B] transition-colors leading-snug mb-2 font-serif">
                ${artisan.name}
              </h3>

              <p class="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-4">
                ${artisan.bio}
              </p>
            </div>

            <!-- Remuneration & Action Footer -->
            <div class="pt-4 border-t border-gray-100 mt-2">
              <div class="flex items-center justify-between text-xs mb-3">
                <span class="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 text-[11px]">
                  <i class="fa-solid fa-hand-holding-dollar text-emerald-600"></i> 70% Direct Payout
                </span>
                <span class="text-[11px] text-gray-500">
                  <i class="fa-solid fa-users text-gray-400 mr-1"></i> ${artisan.membersCount ? artisan.membersCount.split(' ')[0] : 'Master'} Artisans
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-dossier-id="${artisan.id}"
                  class="view-dossier-btn px-3 py-2 rounded-xl border border-stone-200 hover:border-[#B8860B] text-stone-700 hover:text-[#B8860B] font-semibold text-xs transition-colors flex items-center justify-center gap-1 bg-stone-50 hover:bg-amber-50/50"
                >
                  <i class="fa-regular fa-id-card text-xs"></i> View Dossier
                </button>
                <a
                  href="${searchUrl}"
                  class="px-3 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9A7008] text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow"
                >
                  <span>Explore Craft</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    DOM.grid.innerHTML = html;

    // Attach click listeners for "View Dossier" buttons
    DOM.grid.querySelectorAll('.view-dossier-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-dossier-id');
        openDossierModal(id);
      });
    });
  }

  // --- Open Master Dossier Modal ---
  function openDossierModal(artisanId) {
    const artisan = state.artisans.find(a => a.id === artisanId);
    if (!artisan || !DOM.modal || !DOM.modalContent) return;

    state.selectedArtisan = artisan;
    const awardBadge = getAwardBadge(artisan.honor);
    const searchUrl = artisan.searchQuery || `search.html?state=${encodeURIComponent(artisan.state)}`;

    DOM.modalContent.innerHTML = `
      <!-- Modal Header Banner -->
      <div class="relative bg-gradient-to-r from-[#211116] to-[#3B1E22] text-white p-6 sm:p-8 pr-16 sm:pr-20">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ${artisan.state} · ${artisan.region} India
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                GI Code: ${artisan.giTag || 'Registered'}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              ${artisan.name}
            </h2>
            <p class="text-amber-200 text-sm font-medium mt-1">
              ${artisan.craft} · ${artisan.district} Hub
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            ${awardBadge}
            <span class="text-xs text-stone-300">
              ${artisan.experience || 'Master Craftsman'}
            </span>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
        <!-- Visual Duo & Key Credentials -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-xl overflow-hidden aspect-[4/3] bg-stone-100 border border-stone-200 shadow-sm relative">
            <img
              src="${artisan.imageUrl || 'assets/master_potter_artisan.webp'}"
              alt="${artisan.name}"
              onerror="this.onerror=null; this.src='assets/parampara_logo_crest.webp';"
              class="w-full h-full object-cover"
            />
            <span class="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-sm">
              Artisan Guild Portrait
            </span>
          </div>
          <div class="rounded-xl overflow-hidden aspect-[4/3] bg-stone-100 border border-stone-200 shadow-sm relative">
            <img
              src="${artisan.craftImageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80'}"
              alt="${artisan.craft}"
              onerror="this.onerror=null; this.src='assets/parampara_logo_crest.webp';"
              class="w-full h-full object-cover"
            />
            <span class="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-sm">
              Masterpiece &amp; Handcraft Details
            </span>
          </div>
        </div>

        <!-- Master Story & Heritage -->
        <div>
          <h4 class="text-sm font-bold tracking-wider uppercase text-amber-900 mb-2 font-serif flex items-center gap-2">
            <i class="fa-solid fa-scroll text-[#B8860B]"></i> Ancestral Heritage &amp; Technique
          </h4>
          <p class="text-gray-700 text-sm leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            ${artisan.bio}
          </p>
        </div>

        <!-- Technical Specification Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-4 bg-stone-50 rounded-xl border border-stone-200/70">
            <span class="font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Raw Materials &amp; Traditional Tools
            </span>
            <p class="text-gray-800 font-medium">
              ${artisan.materials || 'Pure indigenous organic fibers, natural mineral and botanical dyes, ancestral manual tools.'}
            </p>
          </div>
          <div class="p-4 bg-stone-50 rounded-xl border border-stone-200/70">
            <span class="font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Guild Scale &amp; Apprenticeship
            </span>
            <p class="text-gray-800 font-medium">
              ${artisan.membersCount || 'Master guild preserving living intangible craft heritage across rural clusters.'}
            </p>
          </div>
        </div>

        <!-- 70% Direct Payout Pledge Box -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
              <i class="fa-solid fa-hand-holding-heart"></i>
            </div>
            <div>
              <h5 class="text-sm font-extrabold text-emerald-950">
                Parampara 70% Direct Guild Remuneration Guarantee
              </h5>
              <p class="text-xs text-emerald-800 mt-0.5">
                Every acquisition of this artisan's creations transfers 70% of gross value directly to their bank account with zero middleman deduction.
              </p>
            </div>
          </div>
          <span class="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow whitespace-nowrap">
            Audited &amp; Ratified
          </span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          id="modal-close-action-btn"
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
        >
          Close Dossier
        </button>
        <a
          href="${searchUrl}"
          class="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#800000] text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Acquire Creations by ${artisan.name.split(' ')[0]}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    DOM.modal.classList.remove('hidden');
    DOM.modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    const closeBtn = document.getElementById('modal-close-action-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDossierModal);
  }

  // --- Close Master Dossier Modal ---
  function closeDossierModal() {
    if (!DOM.modal) return;
    DOM.modal.classList.add('hidden');
    DOM.modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    state.selectedArtisan = null;
  }

  // --- Reset All Filters ---
  function resetAllFilters() {
    state.searchQuery = '';
    state.currentRegion = 'All';
    state.currentState = 'All';
    state.currentCategory = 'All';
    state.currentAward = 'All';

    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.stateSelect) DOM.stateSelect.value = 'All';

    // Reset region buttons active state
    if (DOM.regionFilters) {
      DOM.regionFilters.querySelectorAll('button').forEach(btn => {
        const val = btn.getAttribute('data-region');
        if (val === 'All') {
          btn.classList.add('bg-[#B8860B]', 'text-white', 'shadow');
          btn.classList.remove('bg-white', 'text-stone-700', 'border');
        } else {
          btn.classList.remove('bg-[#B8860B]', 'text-white', 'shadow');
          btn.classList.add('bg-white', 'text-stone-700', 'border');
        }
      });
    }

    // Reset category buttons active state
    if (DOM.categoryFilters) {
      DOM.categoryFilters.querySelectorAll('button').forEach(btn => {
        const val = btn.getAttribute('data-category');
        if (val === 'All') {
          btn.classList.add('bg-stone-900', 'text-white');
          btn.classList.remove('bg-white', 'text-stone-700');
        } else {
          btn.classList.remove('bg-stone-900', 'text-white');
          btn.classList.add('bg-white', 'text-stone-700');
        }
      });
    }

    // Reset award buttons active state
    if (DOM.awardFilters) {
      DOM.awardFilters.querySelectorAll('button').forEach(btn => {
        const val = btn.getAttribute('data-award');
        if (val === 'All') {
          btn.classList.add('bg-[#800000]', 'text-white');
          btn.classList.remove('bg-white', 'text-stone-700');
        } else {
          btn.classList.remove('bg-[#800000]', 'text-white');
          btn.classList.add('bg-white', 'text-stone-700');
        }
      });
    }

    applyFilters();
  }

  // --- Bind Event Listeners ---
  function bindEvents() {
    // Search input
    if (DOM.searchInput) {
      let debounceTimer = null;
      DOM.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value.trim();
          applyFilters();
        }, 150);
      });
    }

    // Clear search button
    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.addEventListener('click', () => {
        if (DOM.searchInput) DOM.searchInput.value = '';
        state.searchQuery = '';
        applyFilters();
      });
    }

    // State select dropdown
    if (DOM.stateSelect) {
      DOM.stateSelect.addEventListener('change', (e) => {
        state.currentState = e.target.value;
        applyFilters();
      });
    }

    // Region filter buttons
    if (DOM.regionFilters) {
      DOM.regionFilters.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const region = btn.getAttribute('data-region') || 'All';
          state.currentRegion = region;

          DOM.regionFilters.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-[#B8860B]', 'text-white', 'shadow');
            b.classList.add('bg-white', 'text-stone-700', 'border');
          });
          btn.classList.add('bg-[#B8860B]', 'text-white', 'shadow');
          btn.classList.remove('bg-white', 'text-stone-700', 'border');

          applyFilters();
        });
      });
    }

    // Category filter buttons
    if (DOM.categoryFilters) {
      DOM.categoryFilters.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-category') || 'All';
          state.currentCategory = cat;

          DOM.categoryFilters.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-stone-900', 'text-white');
            b.classList.add('bg-white', 'text-stone-700');
          });
          btn.classList.add('bg-stone-900', 'text-white');
          btn.classList.remove('bg-white', 'text-stone-700');

          applyFilters();
        });
      });
    }

    // Award filter buttons
    if (DOM.awardFilters) {
      DOM.awardFilters.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const award = btn.getAttribute('data-award') || 'All';
          state.currentAward = award;

          DOM.awardFilters.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-[#800000]', 'text-white');
            b.classList.add('bg-white', 'text-stone-700');
          });
          btn.classList.add('bg-[#800000]', 'text-white');
          btn.classList.remove('bg-white', 'text-stone-700');

          applyFilters();
        });
      });
    }

    // Reset filters button
    if (DOM.resetFiltersBtn) {
      DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Modal close button & backdrop
    if (DOM.modalCloseBtn) {
      DOM.modalCloseBtn.addEventListener('click', closeDossierModal);
    }
    if (DOM.modalBackdrop) {
      DOM.modalBackdrop.addEventListener('click', closeDossierModal);
    }

    // Escape key listener to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.modal && !DOM.modal.classList.contains('hidden')) {
        closeDossierModal();
      }
    });

    // Check URL parameters on load (e.g., artisans.html?state=Rajasthan or artisans.html?q=Pashmina)
    const urlParams = new URLSearchParams(window.location.search);
    const paramState = urlParams.get('state');
    const paramRegion = urlParams.get('region');
    const paramQuery = urlParams.get('q');
    const paramCategory = urlParams.get('category');

    if (paramState) state.currentState = paramState;
    if (paramRegion) state.currentRegion = paramRegion;
    if (paramQuery) {
      state.searchQuery = paramQuery;
      if (DOM.searchInput) DOM.searchInput.value = paramQuery;
    }
    if (paramCategory) state.currentCategory = paramCategory;
  }

  // --- Initialize on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    bindEvents();
    fetchArtisans();
  });

})();
