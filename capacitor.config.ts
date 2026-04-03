import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulscript.app',
  appName: 'SoulScript',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      backgroundColor: "#0f172a",
      style: "DARK"
    },
    Keyboard: {
      resize: "body",
      style: "DARK"
    }
  }
};

export default config;
