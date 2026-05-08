import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'BazaarAI',
  slug: 'bazaarai',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  scheme: 'bazaarai',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lemon.bazaarai',
  },
  android: {
    package: 'com.lemon.bazaarai',
  },
  plugins: [
    // Expo Router
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'BazaarAI needs camera access to scan your inventory.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
};

export default config;
