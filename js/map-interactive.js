/**
 * Parampara - Ultra-Dynamic 60FPS Indian Craft Map System
 * SVG path interaction, state-anchored popover, particle burst engine, Web Audio harmonics, GI density radar pins & animated counters.
 */

window.STATE_CRAFT_DATA = {
  'IN-RJ': {
    name: 'Rajasthan',
    craft: 'Jaipur Blue Pottery & Meenakari',
    giCount: 34,
    region: 'west',
    masterArtisan: 'Shri Gopal Saini',
    award: 'Shilp Guru & President Honor',
    imageUrl: 'assets/products/blue_pottery_vase.png',
    description: '14th-century low-fire quartz alchemy from Jaipur, hand-painted with cobalt oxide glaze and enamel work.',
    link: 'state_categories.html?name=Rajasthan#categories-grid'
  },
  'IN-UP': {
    name: 'Uttar Pradesh',
    craft: 'Banarasi Brocade & Chikankari',
    giCount: 36,
    region: 'north',
    masterArtisan: 'Mustafa Ahmed',
    award: 'National Master Weaver',
    imageUrl: 'assets/products/banarasi_saree.png',
    description: 'Royal Zari-work brocades woven with pure silk and silver-dipped threads alongside delicate Lucknow Chikankari.',
    link: 'state_categories.html?name=Uttar%20Pradesh#categories-grid'
  },
  'IN-GJ': {
    name: 'Gujarat',
    craft: 'Patan Patola & Bandhani Tie-Dye',
    giCount: 17,
    region: 'west',
    masterArtisan: 'Meera Kumari',
    award: 'Export Excellence Awardee',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAprV_evWv9fBTiuUU5-pgVoyqsyfFJtyrmNnPruafwHfhWanZMghKy4PxZAtKqnqWA50if4mC3KXl49fO-GQkLepxkU25MqMHjH1pC-_3Rcs2937xi0qHrG7e17vU3RSs_v5mNFMlienR329eOfn2REG04Enzb_B9Wx9mrKklRw1nTr3STtYThY40LUCLv6vXO2EgcrJDsR34eErjtmTbD9Fi8IsGh-ysGLyUViwBK3NGqZqgrTLGf',
    description: 'Double-ikat silk weaving of Patan where warp and weft threads are individually tie-dyed before weaving.',
    link: 'state_categories.html?name=Gujarat#categories-grid'
  },
  'IN-TN': {
    name: 'Tamil Nadu',
    craft: 'Kanchipuram Silk & Thanjavur Art',
    giCount: 28,
    region: 'south',
    masterArtisan: 'Ramanathan Achari',
    award: 'Heritage Master Goldsmith',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeITt6rebpBA8djqWobOyk4s0GE8wPMEAVByzrVK65MCsS0HFWuEI3BTKFyrAdMAWN3adq19WqcwyNYKO1mDmP5dYGoWd0HvV0WrLk5NP38NAyHXWOdInBpw7mjbqJxKiDTGPZiPNL20N3tnWMR94xJW-EOrErX4U9d31w-27veKgB-UZopnNE7npCFjGTcJMPk9C6CHIPRp3y2TdI-_Nx7onXUhtjTX-JXNovA3YLJ5KI2FNBeVSS',
    description: 'Heavy mulberry silk with pure gold zari borders and sacred 24k gold leaf Thanjavur relief paintings.',
    link: 'state_categories.html?name=Tamil%20Nadu#categories-grid'
  },
  'IN-OR': {
    name: 'Odisha',
    craft: 'Pattachitra Painting & Tarakasi',
    giCount: 19,
    region: 'central',
    masterArtisan: 'Annapurna Dasi',
    award: 'Master Pattachitra Artist',
    imageUrl: 'assets/products/pattachitra_painting.png',
    description: 'Vivid scroll painting on treated cloth using natural stone colors and intricate silver wire Tarakasi.',
    link: 'state_categories.html?name=Odisha#categories-grid'
  },
  'IN-CT': {
    name: 'Chhattisgarh',
    craft: 'Dhokra Lost-Wax Metal Casting',
    giCount: 11,
    region: 'central',
    masterArtisan: 'Ramesh Sahu',
    award: 'Tribal Craft State Award',
    imageUrl: 'assets/products/dokra_figurine.png',
    description: '4,000-year-old non-ferrous lost-wax casting technique producing rustic, hollow metallic tribal sculptures.',
    link: 'state_categories.html?name=Chhattisgarh#categories-grid'
  },
  'IN-JK': {
    name: 'Jammu and Kashmir',
    craft: 'Kashmiri Pashmina & Walnut Wood',
    giCount: 10,
    region: 'north',
    masterArtisan: 'Ustad Abdul Karim',
    award: 'UNESCO Heritage Recognition',
    imageUrl: 'https://picsum.photos/seed/kashmirWood/600/400',
    description: 'Ultra-fine hand-spun Changthangi goat Pashmina and intricately carved walnut wood chests.',
    link: 'state_categories.html?name=Jammu%20and%20Kashmir#categories-grid'
  },
  'IN-BR': {
    name: 'Bihar',
    craft: 'Madhubani Painting & Sujini',
    giCount: 14,
    region: 'central',
    masterArtisan: 'Smt. Ratan Devi',
    award: 'National Awardee · Mithila Art',
    imageUrl: 'https://picsum.photos/seed/RatanDevi/600/600',
    description: 'Ancient Mithila folk canvas painting using twig brushes, natural dyes, and geometric narrative line work.',
    link: 'state_categories.html?name=Bihar#categories-grid'
  },
  'IN-MP': {
    name: 'Madhya Pradesh',
    craft: 'Chanderi Weaves & Gond Tribal Art',
    giCount: 15,
    region: 'central',
    masterArtisan: 'Bhuribai Gond',
    award: 'Padma Shri Awardee',
    imageUrl: 'https://picsum.photos/seed/MadhyaPradesh/600/400',
    description: 'Feather-light sheer silk-cotton Chanderi weaves adorned with golden zari and mythic dots of Gond painting.',
    link: 'state_categories.html?name=Madhya%20Pradesh#categories-grid'
  },
  'IN-AS': {
    name: 'Assam',
    craft: 'Golden Muga Silk & Cane Crafts',
    giCount: 12,
    region: 'northeast',
    masterArtisan: 'Pranita Gogoi',
    award: 'Master Weaver Award',
    imageUrl: 'https://picsum.photos/seed/Assam/600/400',
    description: 'Naturally lustrous golden-yellow Muga silk, exclusive to the Brahmaputra valley, growing richer with every wash.',
    link: 'state_categories.html?name=Assam#categories-grid'
  },
  'IN-KL': {
    name: 'Kerala',
    craft: 'Aranmula Kannadi & Kasavu Weaves',
    giCount: 16,
    region: 'south',
    masterArtisan: 'Janardhanan Achari',
    award: 'Metallurgy Heritage Craftsman',
    imageUrl: 'https://picsum.photos/seed/Kerala/600/400',
    description: 'Secret copper-tin alloy front-surface metal mirrors handcrafted without silvering or glass.',
    link: 'state_categories.html?name=Kerala#categories-grid'
  },
  'IN-KA': {
    name: 'Karnataka',
    craft: 'Sandalwood Carving & Mysore Silk',
    giCount: 22,
    region: 'south',
    masterArtisan: 'Basavaraja Gudigar',
    award: 'State Shilpa Award',
    imageUrl: 'https://picsum.photos/seed/Karnataka/600/400',
    description: 'Aromatic Malnad sandalwood relief sculpture and pure gold zari-bordered Mysore silk sarees.',
    link: 'state_categories.html?name=Karnataka#categories-grid'
  },
  'IN-MH': {
    name: 'Maharashtra',
    craft: 'Paithani Silk & Warli Tribal Art',
    giCount: 13,
    region: 'west',
    masterArtisan: 'Shantaram Peshwe',
    award: 'Master Loom Weaver',
    imageUrl: 'https://picsum.photos/seed/Maharashtra/600/400',
    description: 'Handwoven silk sarees with peacock tapestries in pure gold zari and ancient Warli white-pigment ritual motifs.',
    link: 'state_categories.html?name=Maharashtra#categories-grid'
  },
  'IN-WB': {
    name: 'West Bengal',
    craft: 'Jamdani Muslin & Kantha Stitch',
    giCount: 18,
    region: 'central',
    masterArtisan: 'Biren Basak',
    award: 'National Master Weaver',
    imageUrl: 'https://picsum.photos/seed/WestBengal/600/400',
    description: 'Featherweight sheer muslin Jamdani woven on pit looms using floating supplementary wrap threads.',
    link: 'state_categories.html?name=West%20Bengal#categories-grid'
  },
  'IN-PB': {
    name: 'Punjab',
    craft: 'Phulkari Floral Embroidery',
    giCount: 8,
    region: 'north',
    masterArtisan: 'Harpreet Kaur',
    award: 'Folk Textile Master',
    imageUrl: 'https://picsum.photos/seed/Punjab/600/400',
    description: 'Vibrant geometric untwisted silk thread damask stitching on coarse cotton khaddar.',
    link: 'state_categories.html?name=Punjab#categories-grid'
  },
  'IN-HP': {
    name: 'Himachal Pradesh',
    craft: 'Kullu Shawls & Chamba Rumal',
    giCount: 9,
    region: 'north',
    masterArtisan: 'Lal Chand Thakur',
    award: 'National Handloom Award',
    imageUrl: 'https://picsum.photos/seed/HimachalPradesh/600/400',
    description: 'Geometric woollen border shawls and double-sided needlework silk Chamba miniature embroidery.',
    link: 'state_categories.html?name=Himachal%20Pradesh#categories-grid'
  },
  'IN-AP': {
    name: 'Andhra Pradesh',
    craft: 'Kalamkari & Kondapalli Toys',
    giCount: 16,
    region: 'south',
    masterArtisan: 'Gurappa Chetty',
    award: 'Shilp Guru Awardee',
    imageUrl: 'https://picsum.photos/seed/AndhraPradesh/600/400',
    description: 'Pen-drawn freehand organic dye Kalamkari on cotton depicting temple iconography and epics.',
    link: 'state_categories.html?name=Andhra%20Pradesh#categories-grid'
  },
  'IN-TG': {
    name: 'Telangana',
    craft: 'Bidriware Metal Inlay & Pochampally',
    giCount: 11,
    region: 'south',
    masterArtisan: 'Shah Rasheed Qadri',
    award: 'Padma Shri Awardee',
    imageUrl: 'https://picsum.photos/seed/Telangana/600/400',
    description: 'Blackened zinc-copper alloy encrusted with delicate pure silver wire inlay and geometric Ikats.',
    link: 'state_categories.html?name=Telangana#categories-grid'
  },
  'IN-UT': {
    name: 'Uttarakhand',
    craft: 'Aipan Art & Ringal Cane Work',
    giCount: 7,
    region: 'north',
    masterArtisan: 'Meenakshi Khati',
    award: 'Kumaon Folk Art Preservation',
    imageUrl: 'https://picsum.photos/seed/Uttarakhand/600/400',
    description: 'Sacred ritualistic red-clay and rice-paste floor/wall motifs along with high-altitude Ringal bamboo weaving.',
    link: 'state_categories.html?name=Uttarakhand#categories-grid'
  },
  'IN-JH': {
    name: 'Jharkhand',
    craft: 'Sohrai-Khovar Painting & Tussar',
    giCount: 6,
    region: 'central',
    masterArtisan: 'Justin Karim',
    award: 'Tribal Heritage Award',
    imageUrl: 'https://picsum.photos/seed/Jharkhand/600/400',
    description: 'Natural earth-pigment mural painting executed by tribal women celebrating harvest and fertility.',
    link: 'state_categories.html?name=Jharkhand#categories-grid'
  },
  'IN-GA': {
    name: 'Goa',
    craft: 'Azulejo Ceramic Tiles',
    giCount: 5,
    region: 'west',
    masterArtisan: 'Orlando de Noronha',
    award: 'Luso-Indian Tile Master',
    imageUrl: 'https://picsum.photos/seed/Goa/600/400',
    description: 'Hand-painted cobalt glazed ceramic tiles reflecting 400 years of Portuguese-Goan fusion.',
    link: 'state_categories.html?name=Goa#categories-grid'
  },
  'IN-HR': {
    name: 'Haryana',
    craft: 'Terracotta Pottery & Durries',
    giCount: 5,
    region: 'north',
    masterArtisan: 'Ram Pal Prajapati',
    award: 'Terracotta Master Craftsman',
    imageUrl: 'https://picsum.photos/seed/Haryana/600/400',
    description: 'Traditional low-fire red clay water vessels and thick handloom durries.',
    link: 'state_categories.html?name=Haryana#categories-grid'
  },
  'IN-SK': {
    name: 'Sikkim',
    craft: 'Thangka Canvas & Choktse Tables',
    giCount: 4,
    region: 'northeast',
    masterArtisan: 'Tenzin Norbu',
    award: 'Monastic Thangka Master',
    imageUrl: 'https://picsum.photos/seed/Sikkim/600/400',
    description: 'Sacred Buddhist Thangka scroll paintings on silk canvas detailed with ground gold leaf.',
    link: 'state_categories.html?name=Sikkim#categories-grid'
  },
  'IN-AR': {
    name: 'Arunachal Pradesh',
    craft: 'Wancho Beadwork & Textiles',
    giCount: 4,
    region: 'northeast',
    masterArtisan: 'Chow Phangan',
    award: 'Dawn-Lit Tribal Award',
    imageUrl: 'https://picsum.photos/seed/ArunachalPradesh/600/400',
    description: 'Intricate seed bead neckwear and loin-loom geometric tribal tapestries.',
    link: 'state_categories.html?name=Arunachal%20Pradesh#categories-grid'
  },
  'IN-ML': {
    name: 'Meghalaya',
    craft: 'Eri Peace Silk & Cane Weaving',
    giCount: 5,
    region: 'northeast',
    masterArtisan: 'Phyrnai Ryngksai',
    award: 'Ahimsa Silk Pioneer',
    imageUrl: 'https://picsum.photos/seed/Meghalaya/600/400',
    description: 'Non-violent Ahimsa Eri silk processed without harming silkworms, dyed in organic forest barks.',
    link: 'state_categories.html?name=Meghalaya#categories-grid'
  },
  'IN-NL': {
    name: 'Nagaland',
    craft: 'Naga Tribal Shawls & Beadwork',
    giCount: 5,
    region: 'northeast',
    masterArtisan: 'Abeno Ao',
    award: 'Naga Cultural Lineage Honor',
    imageUrl: 'https://picsum.photos/seed/Nagaland/600/400',
    description: 'Hand-spun warrior shawls featuring symbolic tribal stripes and traditional glass bead ornaments.',
    link: 'state_categories.html?name=Nagaland#categories-grid'
  },
  'IN-MN': {
    name: 'Manipur',
    craft: 'Longpi Black Stone Pottery',
    giCount: 6,
    region: 'northeast',
    masterArtisan: 'Machihan Sasa',
    award: 'Padma Shri Awardee',
    imageUrl: 'https://picsum.photos/seed/Manipur/600/400',
    description: 'Black earthenware Longpi pottery shaped by hand from weathered serpentinite stone powder.',
    link: 'state_categories.html?name=Manipur#categories-grid'
  },
  'IN-MZ': {
    name: 'Mizoram',
    craft: 'Puan Handloom Textiles',
    giCount: 4,
    region: 'northeast',
    masterArtisan: 'Lalropuii',
    award: 'Mizo Weaving Master',
    imageUrl: 'https://picsum.photos/seed/Mizoram/600/400',
    description: 'Intricately patterned ceremonial Puan fabric woven on traditional waist-frame looms.',
    link: 'state_categories.html?name=Mizoram#categories-grid'
  },
  'IN-TR': {
    name: 'Tripura',
    craft: 'Cane & Bamboo Master Craft',
    giCount: 4,
    region: 'northeast',
    masterArtisan: 'Manindra Debbarma',
    award: 'Bamboo Master Craftsman',
    imageUrl: 'https://picsum.photos/seed/Tripura/600/400',
    description: 'Ultra-fine split bamboo lampshades, screens, and furniture crafted from indigenous bamboo species.',
    link: 'state_categories.html?name=Tripura#categories-grid'
  }
};

/* --- WEB AUDIO HARMONIC SYNTHESIZER --- */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playHarmonicTone(freq, duration = 0.35, type = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
function playHoverSound(stateId) {
  const code = stateId ? stateId.charCodeAt(stateId.length - 1) : 0;
  const freq = PENTATONIC_SCALE[code % PENTATONIC_SCALE.length];
  playHarmonicTone(freq, 0.3, 'sine');
}

function playSelectSound() {
  playHarmonicTone(523.25, 0.4, 'triangle');
  setTimeout(() => playHarmonicTone(659.25, 0.5, 'sine'), 80);
}

/* --- CANVAS PARTICLE BURST ENGINE --- */
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  burst(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: Math.random() * 3 + 1.2,
        alpha: 1,
        color: ['#B8860B', '#FFD700', '#FFFFFF', '#DAA520'][Math.floor(Math.random() * 4)],
        decay: Math.random() * 0.025 + 0.02
      });
    }
    if (!this.animId) this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.alpha -= p.decay;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.animId = null;
    }
  }
}

/* --- ANIMATED COUNTER TICKER --- */
function animateCounter(el, targetNum, prefix = '', suffix = '') {
  const duration = 450;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const current = Math.floor(progress * targetNum);
    el.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/* --- MAIN INTERACTIVE SETUP --- */
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('india-svg-container');
  const tooltip = document.getElementById('map-hover-tooltip');
  const drawer = document.getElementById('state-dossier-drawer');
  const searchInput = document.getElementById('map-craft-search');
  const particleCanvas = document.getElementById('map-particle-canvas');

  if (!mapContainer) return;

  let particleEngine = null;
  if (particleCanvas) {
    particleEngine = new ParticleEngine(particleCanvas);
  }

  if (tooltip && tooltip.parentElement !== document.body) {
    document.body.appendChild(tooltip);
  }

  const svg = mapContainer.querySelector('svg');
  if (svg) {
    setupMapInteractions();
  } else {
    fetch('india.svg')
      .then(r => r.text())
      .then(svgText => {
        mapContainer.innerHTML = svgText;
        setupMapInteractions();
      })
      .catch(err => console.error('Error loading SVG map:', err));
  }

  let activeStateId = null;

  function setupMapInteractions() {
    const svgEl = mapContainer.querySelector('svg');
    if (!svgEl) return;

    renderGiRadarPins(svgEl);

    const paths = mapContainer.querySelectorAll('path[id^="IN-"]');

    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const data = window.STATE_CRAFT_DATA[stateId];

      path.classList.add('map-state-path');
      path.setAttribute('tabindex', '0');

      // Mouseenter
      path.addEventListener('mouseenter', () => {
        if (!data) return;
        highlightStatePath(path, true);
        showTooltip(path, data);
        playHoverSound(stateId);
      });

      // Mousemove -> Throttled with rAF for 60FPS precision
      let rafPending = false;
      path.addEventListener('mousemove', () => {
        if (!data || rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          positionTooltipOnState(path);
          rafPending = false;
        });
      });

      // Mouseleave
      path.addEventListener('mouseleave', () => {
        if (path.getAttribute('id') !== activeStateId) {
          highlightStatePath(path, false);
        }
        hideTooltip();
      });

      // Click
      path.addEventListener('click', (e) => {
        if (!data) return;
        selectState(stateId, path);

        if (particleEngine) {
          particleEngine.burst(e.clientX, e.clientY);
        }
        playSelectSound();
      });
    });

    const updatePosition = () => {
      if (activeStateId) {
        const activePath = mapContainer.querySelector(`#${activeStateId}`);
        if (activePath) positionTooltipOnState(activePath);
      }
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
  }

  function renderGiRadarPins(svg) {
    let pinGroup = svg.querySelector('#gi-radar-pins');
    if (!pinGroup) {
      pinGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      pinGroup.setAttribute('id', 'gi-radar-pins');
      svg.appendChild(pinGroup);
    }
    pinGroup.innerHTML = '';

    const paths = svg.querySelectorAll('path[id^="IN-"]');
    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const data = window.STATE_CRAFT_DATA[stateId];
      if (!data || data.giCount < 15) return;

      try {
        const bbox = path.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'gi-pin-group cursor-pointer');
        g.addEventListener('click', (e) => {
          selectState(stateId, path);
          if (particleEngine) particleEngine.burst(e.clientX, e.clientY);
          playSelectSound();
        });

        g.innerHTML = `
          <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="#B8860B" stroke-width="1.5" opacity="0.6">
            <animate attributeName="r" values="4;18;4" dur="2.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="${cx}" cy="${cy}" r="4" fill="#B8860B" stroke="#FFFFFF" stroke-width="1"/>
        `;
        pinGroup.appendChild(g);
      } catch (e) {}
    });
  }

  function highlightStatePath(path, isHover) {
    if (isHover) {
      path.classList.add('state-active');
      path.classList.remove('state-dimmed');
    } else {
      path.classList.remove('state-active');
    }
  }

  function showTooltip(path, data) {
    if (!tooltip) return;
    tooltip.innerHTML = `
      <div class="relative">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-[#B8860B] animate-ping"></span>
          <span class="text-[10px] font-bold tracking-widest text-[#B8860B] uppercase">${data.name}</span>
        </div>
        <div class="font-serif text-sm font-bold text-white leading-tight mb-1">${data.craft}</div>
        <div class="text-[10px] text-gray-300 flex items-center justify-between gap-4 mt-2 pt-2 border-t border-white/10">
          <span>🏆 ${data.giCount} GI Certifications</span>
          <span class="text-[#B8860B] font-semibold">Click to Inspect →</span>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    `;
    tooltip.classList.remove('opacity-0', 'pointer-events-none');
    tooltip.classList.add('opacity-100');
    positionTooltipOnState(path);
  }

  function positionTooltipOnState(path) {
    if (!tooltip) return;
    const rect = path.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || 280;
    const tooltipHeight = tooltip.offsetHeight || 110;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - tooltipHeight - 12;

    const arrow = tooltip.querySelector('.tooltip-arrow');

    if (top < 70) {
      top = rect.bottom + 12;
      if (arrow) {
        arrow.style.top = '-6px';
        arrow.style.bottom = 'auto';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        arrow.style.borderTop = '1px solid rgba(184, 134, 11, 0.6)';
        arrow.style.borderLeft = '1px solid rgba(184, 134, 11, 0.6)';
        arrow.style.borderBottom = 'none';
        arrow.style.borderRight = 'none';
      }
    } else {
      if (arrow) {
        arrow.style.bottom = '-6px';
        arrow.style.top = 'auto';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        arrow.style.borderBottom = '1px solid rgba(184, 134, 11, 0.6)';
        arrow.style.borderRight = '1px solid rgba(184, 134, 11, 0.6)';
        arrow.style.borderTop = 'none';
        arrow.style.borderLeft = 'none';
      }
    }

    if (left < 16) {
      left = 16;
    } else if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('opacity-100');
    tooltip.classList.add('opacity-0', 'pointer-events-none');
  }

  window.selectState = function(stateId, targetPath) {
    activeStateId = stateId;
    const data = window.STATE_CRAFT_DATA[stateId];
    if (!data) return;

    const paths = mapContainer.querySelectorAll('path[id^="IN-"]');
    paths.forEach(p => highlightStatePath(p, false));

    const path = targetPath || mapContainer.querySelector(`#${stateId}`);
    if (path) {
      highlightStatePath(path, true);
      showTooltip(path, data);
      positionTooltipOnState(path);
    }

    openDossierDrawer(data);
  };

  function openDossierDrawer(data) {
    if (!drawer) return;

    document.getElementById('dossier-state-name').textContent = data.name;
    document.getElementById('dossier-craft-title').textContent = data.craft;

    const giEl = document.getElementById('dossier-[#gi]');
    if (giEl) {
      animateCounter(giEl, data.giCount, '', ' Verified GI Tagged Crafts');
    }

    document.getElementById('dossier-master-name').textContent = data.masterArtisan;
    document.getElementById('dossier-award').textContent = data.award;
    document.getElementById('dossier-desc').textContent = data.description;
    document.getElementById('dossier-img').src = data.imageUrl;
    document.getElementById('dossier-link').href = data.link;

    drawer.classList.remove('translate-x-full', 'opacity-0', 'pointer-events-none');
    drawer.classList.add('translate-x-0', 'opacity-100');
  }

  window.closeDossierDrawer = function() {
    if (!drawer) return;
    drawer.classList.add('translate-x-full', 'opacity-0', 'pointer-events-none');
    drawer.classList.remove('translate-x-0', 'opacity-100');
    activeStateId = null;
    hideTooltip();

    const paths = mapContainer.querySelectorAll('path[id^="IN-"]');
    paths.forEach(p => highlightStatePath(p, false));
  };

  // Search Craft Illumination Logic
  if (searchInput) {
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        const paths = mapContainer.querySelectorAll('path[id^="IN-"]');

        paths.forEach(path => {
          const stateId = path.getAttribute('id');
          const data = window.STATE_CRAFT_DATA[stateId];

          if (!query) {
            highlightStatePath(path, false);
            path.classList.remove('state-dimmed');
            return;
          }

          if (data && (
            data.name.toLowerCase().includes(query) ||
            data.craft.toLowerCase().includes(query) ||
            data.description.toLowerCase().includes(query) ||
            data.masterArtisan.toLowerCase().includes(query)
          )) {
            highlightStatePath(path, true);
          } else {
            path.classList.remove('state-active');
            path.classList.add('state-dimmed');
          }
        });
      }, 250);
    });
  }

  // Hook Region Filters to illuminate states on map
  const originalFilterRegion = window.filterRegion;
  window.filterRegion = function(region) {
    if (typeof originalFilterRegion === 'function') {
      originalFilterRegion(region);
    }

    const paths = mapContainer.querySelectorAll('path[id^="IN-"]');
    paths.forEach(path => {
      const stateId = path.getAttribute('id');
      const data = window.STATE_CRAFT_DATA[stateId];

      if (region === 'all') {
        highlightStatePath(path, false);
        path.classList.remove('state-dimmed');
      } else if (data && data.region === region) {
        highlightStatePath(path, true);
      } else {
        path.classList.remove('state-active');
        path.classList.add('state-dimmed');
      }
    });
  };
});
