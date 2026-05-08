import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore, makeId } from './store/useStore';
import { enrichProduct, publishShop, getShopProducts } from './services/api';
import ProductRow, { COL_WIDTHS } from './components/ProductRow';
import { STORE_BASE_URL } from './constants.js';

type PublishState = 'idle' | 'loading' | 'success' | 'error';

export default function AdminScreen() {
  const scannedProducts = useStore((s) => s.scannedProducts);
  const updateProductById = useStore((s) => s.updateProductById);
  const removeProductById = useStore((s) => s.removeProductById);
  const addProduct = useStore((s) => s.addProduct);
  const setScannedProducts = useStore((s) => s.setScannedProducts);
  const shop = useStore((s) => s.shop);
  const ownerId = useStore((s) => s.ownerId);

  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const enrichmentTriggered = useRef(false);
  const fetchTriggered = useRef(false);

  // ─── Step 1: Fetch products from backend on mount ─────────────────────────
  // Per instructions: "Fetch all products: GET /api/shop/:id/products"

  useEffect(() => {
    if (fetchTriggered.current || !shop?.id) return;
    fetchTriggered.current = true;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const result = await getShopProducts(shop.id);
        if (result.products && result.products.length > 0) {
          // Merge fetched products with any already in the store (from scan)
          // Store takes priority if already populated; otherwise use backend data
          if (scannedProducts.length === 0) {
            setScannedProducts(
              result.products.map((p) => ({
                id: makeId(),
                name: p.name,
                brand: p.brand,
                quantity: p.quantity,
                category: p.category,
                price: p.price || '',
                specs: p.specs || '',
                isEnriching: false,
              })),
            );
          }
        }
      } catch (err) {
        console.warn('[BazaarAI] Failed to fetch shop products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [shop?.id]);

  // ─── Step 2: Enrichment with concurrency limit of 3 ─────────────────────

  const runEnrichment = useCallback(
    async (product: { id: string; name: string }) => {
      updateProductById(product.id, { isEnriching: true });
      try {
        // Per contract: send productName (not name+brand)
        const result = await enrichProduct(product.name, null);
        if (result.success && result.enriched) {
          updateProductById(product.id, {
            price: result.data.price ?? '',
            specs: [result.data.specs, result.data.unit].filter(Boolean).join(' · ') || '',
            isEnriching: false,
          });
        } else {
          updateProductById(product.id, { isEnriching: false });
        }
      } catch (err) {
        console.warn(`[BazaarAI] Enrich failed for "${product.name}":`, err);
        updateProductById(product.id, { isEnriching: false });
      }
    },
    [updateProductById],
  );

  useEffect(() => {
    if (enrichmentTriggered.current) return;
    enrichmentTriggered.current = true;

    const toEnrich = scannedProducts.filter((p) => !p.price);
    if (toEnrich.length === 0) return;

    // Concurrency limit of 3 — per instructions
    const CONCURRENCY = 3;
    let index = 0;

    const runNext = async () => {
      if (index >= toEnrich.length) return;
      const product = toEnrich[index++];
      await runEnrichment(product);
      runNext();
    };

    const initial = Math.min(CONCURRENCY, toEnrich.length);
    for (let i = 0; i < initial; i++) runNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Publish ──────────────────────────────────────────────────────────────
  // Per instructions: show modal with URL + copy button on success

  const handlePublish = async () => {
    if (!shop?.id || !ownerId) {
      Alert.alert('Missing session', 'Shop or owner ID not found. Please onboard again.');
      return;
    }
    if (scannedProducts.length === 0) {
      Alert.alert('Empty inventory', 'Add at least one product before publishing.');
      return;
    }

    setPublishState('loading');
    try {
      // Per contract: body is { owner_id }
      const result = await publishShop(shop.id, ownerId);
      if (result.success) {
        const url = `${STORE_BASE_URL}/${shop.slug}`;
        setShareUrl(url);
        setPublishState('success');
      } else {
        setPublishState('error');
      }
    } catch (err) {
      console.error('[BazaarAI] Publish error:', err);
      setPublishState('error');
    }
  };

  // ─── Copy URL to clipboard ────────────────────────────────────────────────

  const handleCopy = () => {
    if (shareUrl) {
      Clipboard.setString(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Add row ──────────────────────────────────────────────────────────────
  // Per instructions: "Add Product button adds empty row at top"

  const handleAddRow = () => {
    addProduct({
      id: makeId(),
      name: '',
      brand: '',
      quantity: '1',
      category: 'other',
      price: '',
      specs: '',
      isEnriching: false,
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loadingProducts && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator color="#00c97a" size="small" />
            <Text style={styles.loadingText}>Loading inventory…</Text>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[0]}
        >
          {/* Sticky column header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: COL_WIDTHS.name }]}>Name</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.brand }]}>Brand</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.qty }]}>Qty</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.cat }]}>Cat.</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.price }]}>Price</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.specs, flexShrink: 1 }]}>Specs</Text>
            <Text style={[styles.th, { width: COL_WIDTHS.actions }]}>Actions</Text>
          </View>

          {/* Empty state */}
          {scannedProducts.length === 0 && !loadingProducts && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No products yet.{'\n'}Tap "+ Add Product" or go back to scan.
              </Text>
            </View>
          )}

          {/* Product rows using extracted ProductRow component */}
          {scannedProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onUpdate={(updates) => updateProductById(product.id, updates)}
              onDelete={() => removeProductById(product.id)}
            />
          ))}

          {/* Add Product at top — per instructions */}
          <TouchableOpacity style={styles.addRow} onPress={handleAddRow} activeOpacity={0.7}>
            <Text style={styles.addRowText}>+ Add Product</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Publish footer */}
        <View style={styles.footer}>
          {publishState === 'success' && shareUrl ? (
            // Per instructions: "show modal with shareable URL" + "copy button"
            <View style={styles.successBanner}>
              <Text style={styles.successTitle}>🎉 Store is Live!</Text>
              <Text style={styles.successSubtitle}>
                Your store is live at baazarai.app/store/{shop?.slug}
              </Text>
              <Text style={styles.successUrl} numberOfLines={1}>{shareUrl}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Text style={styles.copyBtnText}>{copied ? '✓ Copied!' : '📋 Copy Link'}</Text>
              </TouchableOpacity>
            </View>
          ) : publishState === 'error' ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>Publish failed. Check your connection and try again.</Text>
              <TouchableOpacity onPress={() => setPublishState('idle')}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.publishBtn, publishState === 'loading' && styles.publishBtnLoading]}
              onPress={handlePublish}
              disabled={publishState === 'loading'}
              activeOpacity={0.85}
            >
              {publishState === 'loading' ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.publishBtnText}>Publish Store</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d0d' },
  scroll: { flex: 1 },

  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0b2e1a',
    padding: 10,
    paddingHorizontal: 16,
  },
  loadingText: { color: '#00c97a', fontSize: 13 },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  th: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 15, textAlign: 'center', lineHeight: 24 },

  addRow: {
    padding: 18,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1c1c1c',
  },
  addRowText: { color: '#00c97a', fontWeight: '700', fontSize: 15 },

  footer: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 8,
  },
  publishBtn: {
    backgroundColor: '#00c97a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  publishBtnLoading: { backgroundColor: '#003d24' },
  publishBtnText: { color: '#000', fontSize: 17, fontWeight: '800' },

  successBanner: {
    backgroundColor: '#0b2e1a',
    borderWidth: 1,
    borderColor: '#00c97a44',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  successTitle: { color: '#00c97a', fontWeight: '800', fontSize: 18 },
  successSubtitle: { color: '#777', fontSize: 13, textAlign: 'center' },
  successUrl: { color: '#aaa', fontSize: 12, textAlign: 'center' },
  copyBtn: {
    backgroundColor: '#00c97a22',
    borderWidth: 1,
    borderColor: '#00c97a55',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  copyBtnText: { color: '#00c97a', fontWeight: '700', fontSize: 14 },

  errorBanner: {
    backgroundColor: '#2e0b0b',
    borderWidth: 1,
    borderColor: '#e5393544',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    alignItems: 'center',
  },
  errorText: { color: '#e57373', fontSize: 14, textAlign: 'center' },
  retryText: { color: '#00c97a', fontWeight: '700', fontSize: 14 },
});
