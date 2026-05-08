const express = require('express');
const router = express.Router();
const { analyzeFrame } = require('../services/gemini');
const supabase = require('../services/supabase');

/**
 * POST /api/scan
 * Receives a camera frame (base64), returns detected products.
 */
router.post('/', async (req, res) => {
  try {
    const { frame, shopId } = req.body;

    if (!frame || typeof frame !== 'string' || frame.trim().length === 0) {
      return res.status(400).json({ error: 'frame is required', success: false });
    }

    // Strip data URI prefix if present
    const base64 = frame.includes(',') ? frame.split(',')[1] : frame;

    // Detect products via Gemini Vision
    const products = await analyzeFrame(base64);

    // Optionally upsert into Supabase
    if (shopId && Array.isArray(products)) {
      for (const product of products) {
        // Check if product already exists for this shop
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('shop_id', shopId)
          .eq('name', product.name)
          .maybeSingle();

        if (!existing) {
          await supabase.from('products').insert({
            shop_id: shopId,
            name: product.name,
            brand: product.brand || null,
            quantity: product.quantity || null,
            category: product.category || null,
            is_verified: false,
          });
        }
      }
    }

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error('[scan]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;
