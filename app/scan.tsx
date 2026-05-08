// app/scan.tsx
// AR Scanner screen — uses Gemini Vision API directly for real-time detection.

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useStore, makeId } from './store/useStore';
import { bulkSaveProducts } from './services/api';
import { scanFrameWithGemini, GeminiProduct } from './services/gemini';
import AROverlay, { DetectedLabel, DetectionResult } from './components/AROverlay';

const SCAN_INTERVAL_MS = 2500; // Give Gemini time to respond

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  // Cumulative deduplicated inventory list
  const [inventory, setInventory] = useState<GeminiProduct[]>([]);
  // Latest Gemini result shown in the popup card
  const [latestDetection, setLatestDetection] = useState<DetectionResult[] | null>(null);
  // Increments on each detection to trigger popup re-animation
  const [detectionKey, setDetectionKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const cameraRef = useRef<InstanceType<typeof CameraView> | null>(null);
  // Mutex: prevents overlapping Gemini calls
  const isProcessing = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();
  const shop = useStore((s) => s.shop);
  const setScannedProducts = useStore((s) => s.setScannedProducts);

  // ─── Scan pulse animation ──────────────────────────────────────────────────

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!permission?.granted) return;

    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.current.start();

    return () => pulseLoop.current?.stop();
  }, [permission?.granted]);

  const pulseTranslateY = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  // ─── Capture & detect ──────────────────────────────────────────────────────

  const captureFrame = useCallback(async () => {
    if (isProcessing.current || !cameraRef.current) return;
    isProcessing.current = true;
    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.25,       // Low quality = small payload (~300KB vs 3600KB)
        base64: true,
        skipProcessing: Platform.OS === 'android',
      });

      if (!photo?.base64) return;

      // Call Gemini Vision API directly
      const detected = await scanFrameWithGemini(photo.base64);

      if (detected.length > 0) {
        // Haptic feedback on detection
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Show the popup card with this scan's results
        setLatestDetection(detected);
        setDetectionKey((k) => k + 1);

        // Merge into running inventory (deduplicate by lowercased name)
        mergeIntoInventory(detected);
      }
    } catch (err) {
      console.warn('[BazaarAI] Gemini scan error:', err);
    } finally {
      isProcessing.current = false;
      setIsScanning(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!permission?.granted) return;

      intervalRef.current = setInterval(captureFrame, SCAN_INTERVAL_MS);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        isProcessing.current = false;
      };
    }, [permission?.granted, captureFrame]),
  );

  // ─── Deduplication ────────────────────────────────────────────────────────

  const mergeIntoInventory = useCallback((incoming: GeminiProduct[]) => {
    setInventory((prev) => {
      const next = [...prev];
      for (const item of incoming) {
        const existing = next.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase(),
        );
        if (existing) {
          existing.quantity = String(
            parseInt(existing.quantity || '0', 10) + parseInt(item.quantity || '1', 10),
          );
        } else {
          next.push({ ...item });
        }
      }
      return next;
    });
  }, []);

  // ─── Done Scanning ────────────────────────────────────────────────────────

  const handleDone = useCallback(async () => {
    setIsSaving(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      if (shop?.id && inventory.length > 0) {
        await bulkSaveProducts(shop.id, inventory);
      }

      setScannedProducts(
        inventory.map((p) => ({
          id: makeId(),
          name: p.name,
          brand: p.brand,
          quantity: p.quantity,
          category: p.category,
          price: '',
          specs: '',
          isEnriching: false,
        })),
      );
      router.push('/admin');
    } catch (err) {
      console.error('[BazaarAI] Done error:', err);
      router.push('/admin');
    } finally {
      setIsSaving(false);
    }
  }, [inventory, shop?.id, setScannedProducts, router]);

  // ─── Permission gates ─────────────────────────────────────────────────────

  if (!permission) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateText}>Initialising camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Camera Access Required</Text>
        <Text style={styles.gateText}>BazaarAI needs camera access to scan your products.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const totalQty = inventory.reduce((sum, p) => sum + parseInt(p.quantity || '0', 10), 0);
  const labels: DetectedLabel[] = inventory.map((p) => ({ name: p.name, quantity: p.quantity }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Scanning pulse animation */}
      <View style={styles.pulseContainer} pointerEvents="none">
        <Animated.View style={[styles.pulseLine, { transform: [{ translateY: pulseTranslateY }] }]}>
          <View style={styles.pulseGlow} />
        </Animated.View>
      </View>

      {/* AI scanning indicator */}
      {isScanning && (
        <View style={styles.scanningBadge} pointerEvents="none">
          <View style={styles.scanningDot} />
          <Text style={styles.scanningText}>Analysing…</Text>
        </View>
      )}

      {/* AR Overlay: chips + popup card */}
      <AROverlay
        labels={labels}
        latestDetection={latestDetection}
        detectionKey={detectionKey}
      />

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{inventory.length}</Text>
            <Text style={styles.statLabel}>Unique items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalQty}</Text>
            <Text style={styles.statLabel}>Total qty</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.doneBtn,
            (inventory.length === 0 || isSaving) && styles.doneBtnDisabled,
          ]}
          onPress={handleDone}
          activeOpacity={0.85}
          disabled={inventory.length === 0 || isSaving}
        >
          <Text style={styles.doneBtnText}>
            {isSaving
              ? 'Saving…'
              : inventory.length === 0
              ? 'Point camera at products'
              : `Done Scanning (${inventory.length} items) →`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  gate: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  gateTitle: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  gateText: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  grantBtn: {
    marginTop: 8,
    backgroundColor: '#00c97a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  grantBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },

  // Pulse
  pulseContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  pulseLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#00c97a',
    shadowColor: '#00c97a',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  pulseGlow: {
    position: 'absolute',
    top: -60,
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(0,201,122,0.06)',
  },

  // AI scanning indicator
  scanningBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,201,122,0.4)',
  },
  scanningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00c97a',
    shadowColor: '#00c97a',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  scanningText: {
    color: '#00c97a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6,6,6,0.92)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    gap: 32,
  },
  stat: { alignItems: 'center', gap: 3 },
  statValue: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  statLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: { width: 1, height: 36, backgroundColor: '#1e1e1e' },

  doneBtn: {
    backgroundColor: '#00c97a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnDisabled: { backgroundColor: '#111' },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
