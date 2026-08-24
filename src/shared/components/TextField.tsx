import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@theme/useTheme';

type Props = TextInputProps & {
  label: string;
  /** The server's own words for what is wrong with this field. */
  error?: string;
};

export function TextField({ label, error, ...input }: Props) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: scheme.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      <TextInput
        {...input}
        placeholderTextColor={scheme.textMuted}
        style={{
          backgroundColor: scheme.surface,
          borderWidth: 1,
          borderColor: error ? scheme.danger : scheme.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 13,
          color: scheme.text,
          fontSize: 16,
        }}
      />
      {error ? <Text style={{ color: scheme.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}
