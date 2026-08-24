import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '@theme/useTheme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, loading = false, disabled = false }: Props) {
  const { scheme } = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={{
        backgroundColor: scheme.primary,
        opacity: inactive ? 0.6 : 1,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color={scheme.onPrimary} />
      ) : (
        <Text style={{ color: scheme.onPrimary, fontSize: 16, fontWeight: '600' }}>{label}</Text>
      )}
    </Pressable>
  );
}
