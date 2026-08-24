import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persister, queryClient } from '@api/queryClient';
import { RootNavigator } from '@navigation/RootNavigator';
import { useCaptureSync } from '@features/capture/useCaptureSync';
import { useQueueStore } from '@features/capture/queue';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import '../global.css';

void SplashScreen.preventAutoHideAsync();

/**
 * Drains the capture queue for as long as the app is open, wherever the officer
 * happens to be in it. Rendered inside the query provider because the sync
 * invalidates queries when something files.
 */
function Sync() {
  useCaptureSync();

  return null;
}

export default function App() {
  const restore = useAuthStore((state) => state.restore);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const { isDark } = useTheme();

  useEffect(() => {
    void restore();
    void useQueueStore.getState().hydrate();
  }, [restore]);

  useEffect(() => {
    // Hold the splash until the keystore has answered, so the app never flashes
    // the sign-in screen at someone who is already signed in.
    if (!isRestoring) {
      void SplashScreen.hideAsync();
    }
  }, [isRestoring]);

  if (isRestoring) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Sync />
          <RootNavigator />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
