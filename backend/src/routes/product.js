const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

/**
 * PUT /api/product/:id
 * Update a single product (partial update — only provided fields).
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, quantity, category, price, specs, is_verified } = req.body;

    // Build update object from only the fields present in body
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (quantity !== undefined) updates.quantity = quantity;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price;
    if (specs !== undefined) updates.specs = specs;
    if (is_verified !== undefined) updates.is_verified = is_verified;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update', success: false });
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, product });
  } catch (err) {
    console.error('[product:update]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

/**
 * DELETE /api/product/:id
 * Delete a single product.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('[product:delete]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

/**
 * POST /api/product/bulk
 * Bulk insert products for a shop.
 */
router.post('/bulk', async (req, res) => {
  try {
    const { products, shop_id } = req.body;

    if (!shop_id) {
      return res.status(400).json({ error: 'shop_id is required', success: false });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'products array is required and must be non-empty', success: false });
    }

    // Map products to insert format with shop_id
    const productsArray = products.map((p) => ({
      shop_id,
      name: p.name,
      brand: p.brand || null,
      quantity: p.quantity || null,
      category: p.category || null,
      price: p.price || null,
      specs: p.specs || null,
      image_url: p.image_url || null,
      is_verified: p.is_verified || false,
    }));

    const { data, error } = await supabase
      .from('products')
      .insert(productsArray)
      .select();

    if (error) throw error;

    return res.json({ success: true, inserted: data.length });
  } catch (err) {
    console.error('[product:bulk]', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;
