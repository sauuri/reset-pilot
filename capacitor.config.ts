import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sauuri.resetpilot',
  appName: 'Reset Pilot',
  webDir: 'out',
  server: {
    url: 'https://reset-pilot.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
