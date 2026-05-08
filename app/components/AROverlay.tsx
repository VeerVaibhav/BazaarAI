// app/components/AROverlay.tsx
// Two-layer AR display:
//   1. Floating chips at the top — running inventory (all detected so far)
//   2. Detection popup card — slides in when Gemini returns new results

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DetectedLabel {
  name: string;
  quantity: string;
}

export interface DetectionResult {
  name: string;
  brand: string;
  quantity: string;
  category: string;
}

interface AROverlayProps {
  /** Running cumulative inventory — all products detected so far */
  labels: DetectedLabel[];
  /** Latest Gemini response — shown as popup card, null when no new scan */
  latestDetection: DetectionResult[] | null;
  /** Timestamp key — changes on each new detection to re-trigger animation */
  detectionKey: number;
}

// ─── Category accent colour map ───────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  grocery:       '#f59e0b',
  beverage:      '#3b82f6',
  snack:         '#f97316',
  dairy:         '#8b5cf6',
  personal_care: '#ec4899',
  household:     '#6366f1',
  medicine:      '#ef4444',
  other:         '#64748b',
};

const CATEGORY_ICON: Record<string, string> = {
  grocery:       '🌾',
  beverage:      '🥤',
  snack:         '🍿',
  dairy:         '🥛',
  personal_care: '🧴',
  household:     '🏠',
  medicine:      '💊',
  other:         '📦',
};

// ─── Main overlay ─────────────────────────────────────────────────────────────

export default function AROverlay({ labels, latestDetection, detectionKey }: AROverlayProps) {
  return (
    <>
      {/* Layer 1: Floating chips at top showing running inventory */}
      <SafeAreaView style={styles.chipsContainer} pointerEvents="none">
        <View style={styles.chipsWrap}>
          {labels.slice(-10).map((label, i) => (
            <AnimatedChip key={`${label.name}-${i}`} label={label} />
          ))}
        </View>
      </SafeAreaView>

      {/* Layer 2: Detection result popup card */}
      {latestDetection && latestDetection.length > 0 && (
        <DetectionPopup
          products={latestDetection}
          triggerKey={detectionKey}
        />
      )}
    </>
  );
}

// ─── Animated chip (running inventory) ───────────────────────────────────────

function AnimatedChip({ label }: { label: DetectedLabel }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.chip, { transform: [{ scale }], opacity }]}>
      <Text style={styles.chipName} numberOfLines={1}>{label.name}</Text>
      <View style={styles.chipBadge}>
        <Text style={styles.chipBadgeText}>×{label.quantity}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Detection popup card ─────────────────────────────────────────────────────

function DetectionPopup({ products, triggerKey }: { products: DetectionResult[]; triggerKey: number }) {
  const slideY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and slide in on each new detection
    slideY.setValue(120);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerKey]);

  return (
    <Animated.View
      style={[
        styles.popup,
        { transform: [{ translateY: slideY }], opacity },
      ]}
      pointerEvents="none"
    >
      {/* Header */}
      <View style={styles.popupHeader}>
        <View style={styles.popupPulse} />
        <Text style={styles.popupHeaderText}>AI DETECTED {products.length} PRODUCT{products.length !== 1 ? 'S' : ''}</Text>
      </View>

      {/* Product cards */}
      {products.slice(0, 4).map((product, i) => {
        const color = CATEGORY_COLOR[product.category] ?? CATEGORY_COLOR.other;
        const icon = CATEGORY_ICON[product.category] ?? '📦';
        return (
          <View key={`${product.name}-${i}`} style={styles.productRow}>
            <View style={[styles.productIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
              <Text style={styles.productIconText}>{icon}</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productBrand} numberOfLines={1}>
                {product.brand}{product.brand && product.category ? ' · ' : ''}{product.category}
              </Text>
            </View>
            <View style={[styles.qtyBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
              <Text style={[styles.qtyText, { color }]}>×{product.quantity}</Text>
            </View>
          </View>
        );
      })}

      {products.length > 4 && (
        <Text style={styles.moreText}>+{products.length - 4} more detected</Text>
      )}
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Floating chips
  chipsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
  },
  chipsWrap: {
    marginTop: 20,
    marginHorizontal: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,201,122,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    maxWidth: 160,
  },
  chipName: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
    flexShrink: 1,
  },
  chipBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  chipBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },

  // Detection popup card
  popup: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(8,8,8,0.95)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,201,122,0.3)',
    shadowColor: '#00c97a',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,201,122,0.1)',
  },
  popupPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00c97a',
    shadowColor: '#00c97a',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  popupHeaderText: {
    color: '#00c97a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Product rows inside popup
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productIconText: { fontSize: 18 },
  productInfo: { flex: 1 },
  productName: {
    color: '#f0f0f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  productBrand: {
    color: '#555',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  qtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  qtyText: { fontSize: 12, fontWeight: '800' },

  moreText: {
    color: '#444',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
