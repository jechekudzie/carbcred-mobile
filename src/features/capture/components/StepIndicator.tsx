import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useTheme } from '@theme/useTheme';

/**
 * Where you are in the capture, and how much is left. Steps already passed show
 * a tick rather than a number: the useful question mid-form is "what is left",
 * not "which number is this".
 */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <View key={step} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done || active ? scheme.accent : scheme.surface,
                  borderWidth: 1,
                  borderColor: done || active ? scheme.accent : scheme.border,
                }}
              >
                {done ? (
                  <Check color={scheme.onPrimary} size={15} strokeWidth={3} />
                ) : (
                  <Text
                    style={{
                      color: active ? scheme.onPrimary : scheme.textMuted,
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    marginHorizontal: 6,
                    backgroundColor: done ? scheme.accent : scheme.border,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={{ color: scheme.text, fontSize: 17, fontWeight: '700' }}>
        {steps[current]}
        <Text style={{ color: scheme.textMuted, fontSize: 14, fontWeight: '400' }}>
          {`   Step ${current + 1} of ${steps.length}`}
        </Text>
      </Text>
    </View>
  );
}
