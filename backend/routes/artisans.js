/**
 * ==============================================================================
 * Parampara (परंपरा) — Master Artisan Guild API Routes
 * File: backend/routes/artisans.js
 * ==============================================================================
 * Exposes sovereign verified master artisans across all 28 Indian States & UTs.
 * Every artisan profile certifies GI registration and 70% direct remuneration.
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

let ARTISANS_CACHE = [];

function loadArtisans() {
  try {
    const dataPath = path.join(__dirname, '../data/artisans.json');
    if (fs.existsSync(dataPath)) {
      ARTISANS_CACHE = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      const rootPath = path.join(__dirname, '../../data/artisans.json');
      if (fs.existsSync(rootPath)) {
        ARTISANS_CACHE = JSON.parse(fs.readFileSync(rootPath, 'utf-8'));
      }
    }
  } catch (err) {
    console.error('Failed to load artisans.json:', err.message);
    ARTISANS_CACHE = [];
  }
}

// Initial load
loadArtisans();

/**
 * GET /api/artisans/stats
 * Returns high-level metrics for the artisan directory.
 */
router.get('/stats', (req, res) => {
  if (ARTISANS_CACHE.length === 0) loadArtisans();

  const states = new Set(ARTISANS_CACHE.map(a => a.state));
  const crafts = new Set(ARTISANS_CACHE.map(a => a.craft));
  const regions = new Set(ARTISANS_CACHE.map(a => a.region));

  res.json({
    success: true,
    totalArtisans: ARTISANS_CACHE.length,
    statesCovered: states.size,
    craftsCovered: crafts.size,
    regionsCovered: regions.size,
    remunerationPledge: "70% Direct Payout to Master Craftsmen",
    giVerifiedPercent: 100
  });
});

/**
 * GET /api/artisans
 * Query parameters:
 *   - state (e.g., 'Rajasthan', 'Karnataka')
 *   - region (e.g., 'North', 'South', 'East', 'West', 'Central', 'North East')
 *   - category (e.g., 'Textiles & Weaves', 'Pottery & Ceramics')
 *   - q (search query matching name, craft, state, district, or giTag)
 */
router.get('/', (req, res) => {
  if (ARTISANS_CACHE.length === 0) loadArtisans();

  const { state, region, category, q } = req.query;
  let results = [...ARTISANS_CACHE];

  if (state && state.trim()) {
    const sTerm = state.trim().toLowerCase();
    results = results.filter(a => a.state.toLowerCase() === sTerm);
  }

  if (region && region.trim()) {
    const rTerm = region.trim().toLowerCase();
    results = results.filter(a => a.region.toLowerCase() === rTerm);
  }

  if (category && category.trim()) {
    const cTerm = category.trim().toLowerCase();
    results = results.filter(a => a.category.toLowerCase().includes(cTerm));
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    results = results.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.craft.toLowerCase().includes(query) ||
      a.state.toLowerCase().includes(query) ||
      a.district.toLowerCase().includes(query) ||
      (a.giTag && a.giTag.toLowerCase().includes(query)) ||
      (a.honor && a.honor.toLowerCase().includes(query)) ||
      (a.bio && a.bio.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    count: results.length,
    total: ARTISANS_CACHE.length,
    data: results
  });
});

/**
 * GET /api/artisans/:id
 * Retrieve specific master artisan dossier by ID.
 */
router.get('/:id', (req, res) => {
  if (ARTISANS_CACHE.length === 0) loadArtisans();

  const artisan = ARTISANS_CACHE.find(a => a.id === req.params.id);
  if (!artisan) {
    return res.status(404).json({
      success: false,
      message: `Master Artisan with ID '${req.params.id}' not found.`
    });
  }

  res.json({
    success: true,
    data: artisan
  });
});

module.exports = router;

