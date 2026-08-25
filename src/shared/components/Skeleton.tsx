import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@theme/useTheme';

/**
 * A placeholder shaped like the thing that is coming.
 *
 * A spinner says "something is happening"; a skeleton says "a list of cards is
 * happening", which is the difference between waiting and wondering. The pulse
 * runs on the UI thread, so it keeps moving while the JS thread parses the
 * response it is waiting for.
 */
export function Skeleton({ height = 16, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  const { scheme } = useTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 850 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { height, width: width as number, borderRadius: radius, backgroundColor: scheme.border },
        style,
      ]}
    />
  );
}

/** A stack of card-shaped placeholders, for a list that is on its way. */
export function SkeletonList({ rows = 3, height = 78 }: { rows?: number; height?: number }) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: scheme.surface,
            borderColor: scheme.border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 16,
            gap: 9,
            height,
            justifyContent: 'center',
          }}
        >
          <Skeleton height={15} width="62%" />
          <Skeleton height={12} width="40%" />
        </View>
      ))}
    </View>
  );
}
