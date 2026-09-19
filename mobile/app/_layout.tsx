import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/lib/store';
import { LanguageProvider } from '@/i18n/LanguageContext';

// Suppress Expo AV SDK 54 deprecation warning for SDK 54 compatibility
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('[expo-av]: Expo AV has been deprecated') ||
     args[0].includes('Expo AV has been deprecated'))
  ) {
    return;
  }
  originalWarn(...args);
};

LogBox.ignoreLogs([
  '[expo-av]: Expo AV has been deprecated',
  'Expo AV has been deprecated',
]);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
        </StoreProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

