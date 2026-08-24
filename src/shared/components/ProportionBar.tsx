import { Text, View } from 'react-native';
import { useTheme } from '@theme/useTheme';

export type Segment = { label: string; value: number; colour: string };

/**
 * One bar carrying several quantities, with the legend under it. Used where the
 * relationship between the parts is the point — verified against estimated
 * against issued — and three separate numbers would hide it.
 */
export function ProportionBar({ segments, unit }: { segments: Segment[]; unit?: string }) {
  const { scheme } = useTheme();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Nothing recorded yet.</Text>;
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' }}>
        {segments.map((segment) =>
          segment.value > 0 ? (
            <View
              key={segment.label}
              style={{ flex: segment.value, backgroundColor: segment.colour }}
            />
          ) : null,
        )}
      </View>

      <View style={{ gap: 5 }}>
        {segments.map((segment) => (
          <View key={segment.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: segment.colour }} />
            <Text style={{ color: scheme.textMuted, fontSize: 13, flex: 1 }}>{segment.label}</Text>
            <Text style={{ color: scheme.text, fontSize: 13, fontWeight: '600' }}>
              {segment.value.toLocaleString()} {unit ?? ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
