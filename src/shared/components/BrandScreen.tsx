import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@theme/useTheme';
import { BrandHeader } from './BrandHeader';

/**
 * A screen that opens on the green band. The band owns the top inset itself, so
 * the colour runs under the status bar instead of stopping at a cream strip.
 */
export function BrandScreen({
  title,
  subtitle,
  header,
  children,
}: {
  title: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
}) {
  const { scheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: scheme.background }}>
      <BrandHeader title={title} subtitle={subtitle}>
        {header}
      </BrandHeader>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
    </View>
  );
}
