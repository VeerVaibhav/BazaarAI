// app/onboarding.tsx
// Auth flow: Welcome → Sign Up | Log In → Shop Setup (new users only) → Scan

import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './services/supabase';
import { createShop, getMyShop } from './services/api';
import { useStore, Shop } from './store/useStore';
import TemplateCard, { TemplateType } from './components/TemplateCard';

// ─── Step Types ───────────────────────────────────────────────────────────────
// welcome → signup | login → shopName → template → (scan)

type Step = 'welcome' | 'signup' | 'login' | 'shopName' | 'template';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const setOwnerId = useStore((s) => s.setOwnerId);
  const setShop = useStore((s) => s.setShop);

  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);

  // ─── Dev bypass ───────────────────────────────────────────────────────────
  // Set to false before shipping. Lets you jump to scan without Supabase auth.
  const DEV_BYPASS = true;

  const handleDevBypass = () => {
    // Inject a mock session so index.tsx auth guard passes
    setOwnerId('dev-user-local');
    setShop({
      id: 'dev-shop-local',
      shop_name: 'Dev Test Shop',
      slug: 'dev-test-shop',
      template: 'grid' as TemplateType,
      location: 'Local',
      is_published: false,
    });
    router.replace('/scan');
  };

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Shop setup fields
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const slug = slugify(shopName);
  const [template, setTemplate] = useState<TemplateType>('grid');

  // ─── Sign Up ─────────────────────────────────────────────────────────────

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and a password.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      if (data.user) {
        setOwnerId(data.user.id);
        // New user → needs shop setup
        setStep('shopName');
      }
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'Could not create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Log In ───────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      if (data.user) {
        setOwnerId(data.user.id);

        // Check if this user already has a shop
        const shopResult = await getMyShop(data.user.id);
        if (shopResult && shopResult.shop) {
          // Returning user with existing shop → go straight to scan
          setShop(shopResult.shop);
          router.replace('/scan');
        } else {
          // User exists but no shop yet → shop setup
          setStep('shopName');
        }
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shop Name → Template ─────────────────────────────────────────────────

  const handleShopName = () => {
    if (shopName.trim().length < 2) {
      Alert.alert('Too short', 'Shop name must be at least 2 characters.');
      return;
    }
    setStep('template');
  };

  // ─── Create Shop & Navigate ───────────────────────────────────────────────

  const handleCreateShop = useCallback(async () => {
    const ownerId = useStore.getState().ownerId;
    if (!ownerId) {
      Alert.alert('Session error', 'Please log in again.');
      setStep('welcome');
      return;
    }

    setLoading(true);
    try {
      const result = await createShop({
        owner_id: ownerId,
        shop_name: shopName.trim(),
        slug,
        template,
        location: location.trim() || undefined,
      });

      if (!result.success || !result.shop) {
        throw new Error(result.error || 'Failed to create shop.');
      }

      const shop: Shop = {
        id: result.shop.id,
        shop_name: result.shop.shop_name,
        slug: result.shop.slug,
        template: result.shop.template as TemplateType,
        location: result.shop.location,
        is_published: result.shop.is_published,
      };

      setShop(shop);
      router.replace('/scan');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create shop. Try again.');
    } finally {
      setLoading(false);
    }
  }, [shopName, slug, template, location, setShop, router]);

  // ─── Shared Input Reset ───────────────────────────────────────────────────

  const switchToSignUp = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setStep('signup');
  };

  const switchToLogin = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setStep('login');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#000000', '#0a0a0a', '#050d05']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Brand Header ── */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🏪</Text>
            </View>
            <Text style={styles.logo}>BaazarAI</Text>
            <Text style={styles.tagline}>
              {step === 'welcome' && 'Intelligent inventory, instant storefronts.'}
              {step === 'signup' && 'Create your account'}
              {step === 'login' && 'Welcome back'}
              {step === 'shopName' && 'Set up your shop'}
              {step === 'template' && 'Design your store'}
            </Text>
          </View>

          {/* ── Step Indicators (only for shop setup steps) ── */}
          {(step === 'shopName' || step === 'template') && (
            <View style={styles.steps}>
              <View style={[styles.stepDot, step === 'shopName' && styles.stepDotActive, step === 'template' && styles.stepDotDone]} />
              <View style={[styles.stepDot, step === 'template' && styles.stepDotActive]} />
            </View>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* WELCOME                                          */}
          {/* ════════════════════════════════════════════════ */}
          {step === 'welcome' && (
            <View style={styles.card}>
              <Text style={styles.welcomeHeadline}>Scan → Enrich → Publish</Text>
              <Text style={styles.welcomeBody}>
                Turn your physical shop into a live digital storefront in minutes. Point your camera at the shelves — our AI does the rest.
              </Text>

              <View style={styles.featureList}>
                {[
                  { icon: '📷', text: 'AI scans your inventory automatically' },
                  { icon: '💡', text: 'Auto-enriches prices & specs' },
                  { icon: '🌐', text: 'Publishes a live shareable store URL' },
                ].map(({ icon, text }) => (
                  <View key={text} style={styles.featureRow}>
                    <Text style={styles.featureIcon}>{icon}</Text>
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryBtnWrap} onPress={switchToSignUp} activeOpacity={0.85}>
                <LinearGradient colors={['#00c97a', '#009d5f']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>Create Free Account</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={switchToLogin} activeOpacity={0.75}>
                <Text style={styles.secondaryBtnText}>I already have an account</Text>
              </TouchableOpacity>

              {DEV_BYPASS && (
                <TouchableOpacity
                  style={styles.devBypassBtn}
                  onPress={handleDevBypass}
                  activeOpacity={0.6}
                >
                  <Text style={styles.devBypassText}>⚡ Dev: Skip to Scanner</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* SIGN UP                                          */}
          {/* ════════════════════════════════════════════════ */}
          {step === 'signup' && (
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#444"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#444"
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.primaryBtnWrap}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#00c97a', '#009d5f']} style={styles.btnGradient}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Create Account →</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchLink} onPress={switchToLogin}>
                <Text style={styles.switchLinkText}>
                  Already have an account?{' '}
                  <Text style={styles.switchLinkAccent}>Log In</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.switchLink, { marginTop: 4 }]} onPress={() => setStep('welcome')}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* LOG IN                                           */}
          {/* ════════════════════════════════════════════════ */}
          {step === 'login' && (
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#444"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#444"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryBtnWrap}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#00c97a', '#009d5f']} style={styles.btnGradient}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Log In →</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchLink} onPress={switchToSignUp}>
                <Text style={styles.switchLinkText}>
                  New here?{' '}
                  <Text style={styles.switchLinkAccent}>Create an account</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.switchLink, { marginTop: 4 }]} onPress={() => setStep('welcome')}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* SHOP NAME                                        */}
          {/* ════════════════════════════════════════════════ */}
          {step === 'shopName' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>SHOP NAME</Text>
              <TextInput
                style={styles.input}
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. Ramesh Kirana Store"
                placeholderTextColor="#444"
                autoFocus
              />

              {slug.length > 0 && (
                <View style={styles.slugPreview}>
                  <Text style={styles.slugLabel}>YOUR STORE URL</Text>
                  <Text style={styles.slugValue}>baazarai.app/store/{slug}</Text>
                </View>
              )}

              <Text style={[styles.cardLabel, { marginTop: 16 }]}>LOCATION (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Lajpat Nagar, Delhi"
                placeholderTextColor="#444"
              />

              <TouchableOpacity style={styles.primaryBtnWrap} onPress={handleShopName} activeOpacity={0.85}>
                <LinearGradient colors={['#00c97a', '#009d5f']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TEMPLATE PICKER                                  */}
          {/* ════════════════════════════════════════════════ */}
          {step === 'template' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>CHOOSE YOUR STOREFRONT STYLE</Text>
              <Text style={styles.cardSubtitle}>You can change this later from settings.</Text>

              <View style={styles.templateList}>
                {(['grid', 'list', 'dark'] as TemplateType[]).map((t) => (
                  <TemplateCard
                    key={t}
                    template={t}
                    selected={template === t}
                    onSelect={setTemplate}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryBtnWrap}
                onPress={handleCreateShop}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#00c97a', '#009d5f']} style={styles.btnGradient}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Launch My Store 🚀</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchLink} onPress={() => setStep('shopName')}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scroll: { padding: 24, paddingBottom: 60, flexGrow: 1 },

  // Header
  header: { alignItems: 'center', marginBottom: 36, marginTop: 16 },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(0,201,122,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,201,122,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 36 },
  logo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: { color: '#555', fontSize: 14, marginTop: 6, textAlign: 'center' },

  // Step dots
  steps: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 28 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a1a1a' },
  stepDotActive: { backgroundColor: '#00c97a', width: 24 },
  stepDotDone: { backgroundColor: '#004d30', width: 24 },

  // Card
  card: {
    backgroundColor: '#0d0d0d',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },

  // Welcome
  welcomeHeadline: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeBody: {
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  featureList: { gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22, width: 32 },
  featureText: { color: '#888', fontSize: 14, flex: 1, lineHeight: 20 },

  // Labels
  cardLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  cardSubtitle: { color: '#555', fontSize: 14, marginBottom: 20, lineHeight: 20 },

  // Inputs
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 14,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 20 },

  // Buttons
  primaryBtnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: -0.2 },

  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  secondaryBtnText: { color: '#888', fontWeight: '600', fontSize: 15 },

  devBypassBtn: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  devBypassText: {
    color: '#2a2a2a',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Links
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchLinkText: { color: '#555', fontSize: 14 },
  switchLinkAccent: { color: '#00c97a', fontWeight: '700' },
  backText: { color: '#444', fontSize: 14, fontWeight: '600' },

  // Slug preview
  slugPreview: {
    backgroundColor: 'rgba(0,201,122,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,201,122,0.12)',
  },
  slugLabel: { color: '#00c97a66', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  slugValue: { color: '#00c97a', fontSize: 13, fontWeight: '700' },

  templateList: { marginBottom: 16 },
});
