import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/useTheme';

/**
 * Every screen sits on the brand's ground colour and inside the safe area, so
 * nothing hides under a notch or a home indicator.
 */
export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const { scheme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: scheme.background }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, paddingHorizontal: padded ? 20 : 0 }}>{children}</View>
    </SafeAreaView>
  );
}
