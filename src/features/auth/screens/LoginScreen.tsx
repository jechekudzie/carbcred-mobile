import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { errorMessage, validationErrors } from '@api/client';
import { Button } from '@shared/components/Button';
import { Screen } from '@shared/components/Screen';
import { TextField } from '@shared/components/TextField';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import { isTwoFactorChallenge, login, type TwoFactorChallenge } from '../api';

export function LoginScreen() {
  const { scheme } = useTheme();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => login({ email: email.trim(), password, ...(code ? { code } : {}) }),
    onMutate: () => {
      setFieldErrors({});
      setMessage(null);
    },
    onSuccess: async (result) => {
      // A second factor: ask for the code and come back through the same call.
      if (isTwoFactorChallenge(result)) {
        setChallenge(result);
        setMessage(result.message);

        return;
      }

      await signIn({
        token: result.token,
        user: result.user,
        organisations: result.organisations,
        passwordChangeRequired: result.password_change_required,
      });
    },
    onError: (error) => {
      setFieldErrors(validationErrors(error) ?? {});
      setMessage(validationErrors(error) ? null : errorMessage(error, 'Could not sign in.'));
    },
  });

  const firstError = (field: string) => fieldErrors[field]?.[0];

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Capped so the form stays a readable column on a tablet rather
              than stretching the full width of the screen. */}
          <View style={{ width: '100%', maxWidth: 420, gap: 22 }}>
            <View style={{ gap: 6, alignItems: 'center' }}>
              <Image
                source={require('@assets/mark.png')}
                style={{ width: 84, height: 84, marginBottom: 8 }}
                resizeMode="contain"
              />
              <Text style={{ color: scheme.text, fontSize: 30, fontWeight: '700', textAlign: 'center' }}>
                CarbCred Africa
              </Text>
              <Text style={{ color: scheme.textMuted, fontSize: 15, textAlign: 'center' }}>
                {challenge ? 'Enter your two-factor code to finish signing in.' : 'Sign in to continue.'}
              </Text>
            </View>

            {message ? (
              <View
                style={{
                  backgroundColor: scheme.surface,
                  borderColor: scheme.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Text style={{ color: scheme.text, fontSize: 14 }}>{message}</Text>
                {challenge?.masked_email ? (
                  <Text style={{ color: scheme.textMuted, fontSize: 13, marginTop: 4 }}>
                    Sent to {challenge.masked_email}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {challenge ? (
              <TextField
                label="Two-factor code"
                value={code}
                onChangeText={setCode}
                error={firstError('code')}
                keyboardType="number-pad"
                autoFocus
                placeholder="000000"
              />
            ) : (
              <View style={{ gap: 16 }}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={firstError('email')}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="you@carbcredafrica.co.zw"
                />
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  error={firstError('password')}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="••••••••"
                />
              </View>
            )}

            <Button
              label={challenge ? 'Verify' : 'Sign in'}
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={challenge ? code.length === 0 : !email || !password}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
