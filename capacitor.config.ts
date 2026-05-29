import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sauuri.resetpilot',
  appName: 'Reset Pilot',
  webDir: 'out',
  server: {
    url: 'https://reset-pilot.vercel.app',
    allowNavigation: ['*.apple.com', 'appleid.apple.com', '*.supabase.co'],
  },
  ios: {
    contentInset: 'never',
  },
};

export default config;
