const express = require('express');
const router = express.Router();
const { scrapeProduct } = require('../services/firecrawl');
const { extractProductInfo } = require('../services/gemini');
const supabase = require('../services/supabase');

/**
 * POST /api/enrich
 * Takes a product name, scrapes pricing, returns enriched data.
 */
router.post('/', async (req, res) => {
  try {
    const { productName, productId } = req.body;

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return res.status(400).json({ error: 'productName is required', success: false });
    }

    // Scrape product from ecommerce sites
    const markdown = await scrapeProduct(productName);

    if (!markdown || markdown.trim().length === 0) {
      return res.json({
        success: true,
        enriched: false,
        productId: productId || null,
        data: { price: null, unit: null, specs: null, source: null },
      });
    }

    // Extract structured info via Gemini
    const { price, unit, specs, source } = await extractProductInfo(markdown, productName);

    // Optionally update the product row in Supabase
    if (productId) {
      await supabase
        .from('products')
        .update({ price, specs, is_verified: true })
        .eq('id', productId);
    }

    return res.json({
      success: true,
      enriched: true,
      productId: productId || null,
      data: { price, unit, specs, source },
    });
  } catch (err) {
    console.error('[enrich]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;
