import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sauuri.resetpilot',
  appName: 'Reset Pilot',
  webDir: 'out',
  server: {
    allowNavigation: ['reset-pilot.vercel.app'],
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
