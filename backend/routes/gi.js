const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load GI database from JSON file
const GI_DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/gi-database.json'), 'utf-8')
);

/**
 * @route   GET /api/gi
 * @desc    Search and filter the GI Registry database
 * @access  Public
 * @params  q (text search), category, state, region, subCategory,
 *          exportEligible, yearFrom, yearTo, sortBy, page, limit
 */
router.get('/', (req, res) => {
  try {
    const {
      q,
      category,
      state,
      region,
      subCategory,
      exportEligible,
      yearFrom,
      yearTo,
      sortBy = 'registrationYear',
      page = 1,
      limit = 20
    } = req.query;

    let results = [...GI_DATA];

    // Full-text search across name, description, craft, state, tags
    if (q && q.trim()) {
      const searchTerms = q.toLowerCase().trim().split(/\s+/);
      results = results.filter(item => {
        const searchable = [
          item.name,
          item.description,
          item.craft,
          item.state,
          item.district,
          item.subCategory,
          item.applicant,
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        return searchTerms.every(term => searchable.includes(term));
      });
    }

    // Category filter (Handicrafts / Agricultural)
    if (category && category !== 'All') {
      results = results.filter(item =>
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // State filter
    if (state && state !== 'All') {
      const statePattern = state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\b(and|&)\b/gi, '(and|&)');
      const stateRegex = new RegExp(statePattern, 'i');
      results = results.filter(item => stateRegex.test(item.state));
    }

    // Region filter
    if (region && region !== 'All') {
      results = results.filter(item =>
        item.region.toLowerCase() === region.toLowerCase()
      );
    }

    // Sub-category filter
    if (subCategory && subCategory !== 'All') {
      results = results.filter(item =>
        item.subCategory.toLowerCase() === subCategory.toLowerCase()
      );
    }

    // Export eligible filter
    if (exportEligible !== undefined && exportEligible !== '') {
      const isExportEligible = exportEligible === 'true';
      results = results.filter(item => item.exportEligible === isExportEligible);
    }

    // Year range filter
    if (yearFrom) {
      results = results.filter(item => item.registrationYear >= parseInt(yearFrom));
    }
    if (yearTo) {
      results = results.filter(item => item.registrationYear <= parseInt(yearTo));
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'registrationYear':
        results.sort((a, b) => a.registrationYear - b.registrationYear);
        break;
      case 'registrationYearDesc':
        results.sort((a, b) => b.registrationYear - a.registrationYear);
        break;
      case 'artisanCount':
        results.sort((a, b) => b.artisanCount - a.artisanCount);
        break;
      case 'state':
        results.sort((a, b) => a.state.localeCompare(b.state));
        break;
      default:
        results.sort((a, b) => a.registrationYear - b.registrationYear);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 per page
    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(offset, offset + limitNum);

    res.json({
      success: true,
      count: totalCount,
      page: pageNum,
      totalPages,
      limit: limitNum,
      data: paginatedResults
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/gi/stats
 * @desc    Aggregate statistics about the GI Registry
 * @access  Public
 */
router.get('/stats', (req, res) => {
  try {
    const total = GI_DATA.length;
    const categoryCounts = {};
    const stateCounts = {};
    const regionCounts = {};
    const subCategoryCounts = {};
    const yearDistribution = {};
    let totalArtisans = 0;
    let exportEligibleCount = 0;

    GI_DATA.forEach(item => {
      // Category
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      // State
      stateCounts[item.state] = (stateCounts[item.state] || 0) + 1;
      // Region
      regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
      // Sub-category
      subCategoryCounts[item.subCategory] = (subCategoryCounts[item.subCategory] || 0) + 1;
      // Year
      yearDistribution[item.registrationYear] = (yearDistribution[item.registrationYear] || 0) + 1;
      // Artisans
      totalArtisans += (item.artisanCount || 0);
      // Export
      if (item.exportEligible) exportEligibleCount++;
    });

    // Top states
    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    res.json({
      success: true,
      stats: {
        total,
        totalArtisans,
        exportEligibleCount,
        exportEligiblePercent: Math.round((exportEligibleCount / total) * 100),
        categoryCounts,
        regionCounts,
        subCategoryCounts,
        topStates,
        yearDistribution,
        statesRepresented: Object.keys(stateCounts).length,
        oldestRegistration: Math.min(...GI_DATA.map(i => i.registrationYear)),
        latestRegistration: Math.max(...GI_DATA.map(i => i.registrationYear))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/gi/filters
 * @desc    Get all available filter options (for dropdowns)
 * @access  Public
 */
router.get('/filters', (req, res) => {
  try {
    const categories = [...new Set(GI_DATA.map(i => i.category))].sort();
    const states = [...new Set(GI_DATA.map(i => i.state))].sort();
    const regions = [...new Set(GI_DATA.map(i => i.region))].sort();
    const subCategories = [...new Set(GI_DATA.map(i => i.subCategory))].sort();
    const years = [...new Set(GI_DATA.map(i => i.registrationYear))].sort();

    res.json({
      success: true,
      filters: { categories, states, regions, subCategories, years }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/gi/:id
 * @desc    Get a single GI item by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const item = GI_DATA.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'GI item not found' });
    }

    // Find related items (same state or subCategory)
    const related = GI_DATA
      .filter(i => i.id !== item.id && (i.state === item.state || i.subCategory === item.subCategory))
      .slice(0, 4);

    res.json({ success: true, data: item, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
