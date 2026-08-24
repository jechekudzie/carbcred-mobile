import type { ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';

/**
 * The green band every screen opens on.
 *
 * Forest is the brand's near-black, so it carries a header the way a dark navy
 * does — cream type on it reads at arm's length in sunlight, which a light
 * header does not. Flat colour, no gradients or overlays: the leaf stripe along
 * the bottom is the second brand colour doing the work of a divider, and the
 * mark sits top-right where it does not compete with the screen's title.
 */
export function BrandHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: isDark ? '#0a2117' : brand.forest,
        paddingTop: insets.top + 14,
        paddingBottom: children ? 20 : 22,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        borderBottomWidth: 4,
        borderBottomColor: brand.leaf,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: brand.cream, fontSize: 26, fontWeight: '700' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: brand.leaf, fontSize: 14, fontWeight: '500' }}>{subtitle}</Text>
          ) : null}
        </View>
        <Image
          source={require('@assets/mark.png')}
          style={{ width: 38, height: 38, marginTop: 2 }}
          resizeMode="contain"
        />
      </View>

      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}
