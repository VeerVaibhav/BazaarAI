// app/index.tsx
// Auth guard — runs AFTER the Root Layout (Stack) has mounted.
// Expo Router rule: never navigate in _layout.tsx useEffect.
// Use <Redirect> or useEffect in child routes instead.

import { Redirect } from 'expo-router';
import { useStore } from './store/useStore';

export default function Index() {
  const ownerId = useStore((s) => s.ownerId);
  const shop = useStore((s) => s.shop);

  // Authenticated + shop configured → go straight to scanner
  if (ownerId && shop) {
    return <Redirect href="/scan" />;
  }

  // No session → welcome / auth screen
  return <Redirect href="/onboarding" />;
}
