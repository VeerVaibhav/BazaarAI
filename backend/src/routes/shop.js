const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { requireOwner } = require('../middleware/auth');

/**
 * POST /api/shop/create
 * Create a new shop.
 */
router.post('/create', requireOwner, async (req, res) => {
  try {
    const { owner_id, shop_name, slug, template, location } = req.body;

    if (!owner_id || !shop_name || !slug) {
      return res.status(400).json({
        error: 'owner_id, shop_name, and slug are required',
        success: false,
      });
    }

    // Sanitize slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check if slug already taken
    const { data: existing } = await supabase
      .from('shops')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'Shop URL already taken. Try a different name.',
        success: false,
      });
    }

    // Insert new shop
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        owner_id,
        shop_name,
        slug: cleanSlug,
        template: template || 'grid',
        location: location || null,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, shop });
  } catch (err) {
    console.error('[shop:create]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

/**
 * GET /api/shop/:slug
 * Get a shop and its verified products by slug (public storefront).
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (shopErr) throw shopErr;
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found', success: false });
    }

    // Only return verified products for public view
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('is_verified', true);

    if (prodErr) throw prodErr;

    return res.json({ success: true, shop, products });
  } catch (err) {
    console.error('[shop:getBySlug]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

/**
 * POST /api/shop/:id/publish
 * Publish a shop (requires at least one product).
 */
router.post('/:id/publish', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_id } = req.body;

    // Fetch shop and verify ownership
    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (shopErr) throw shopErr;
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found', success: false });
    }

    if (shop.owner_id !== owner_id) {
      return res.status(403).json({ error: 'Unauthorized', success: false });
    }

    // Check product count
    const { count, error: countErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', id);

    if (countErr) throw countErr;

    if (!count || count === 0) {
      return res.status(400).json({
        error: 'Add at least one product before publishing',
        success: false,
      });
    }

    // Publish
    const { error: updateErr } = await supabase
      .from('shops')
      .update({ is_published: true })
      .eq('id', id);

    if (updateErr) throw updateErr;

    return res.json({ success: true, url: `/store/${shop.slug}` });
  } catch (err) {
    console.error('[shop:publish]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

/**
 * GET /api/shop/:id/products
 * Get ALL products for a shop (admin panel — includes unverified).
 */
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', id);

    if (error) throw error;

    return res.json({ success: true, products });
  } catch (err) {
    console.error('[shop:products]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;
