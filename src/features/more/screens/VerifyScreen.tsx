import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { api } from '@api/client';
import { Button } from '@shared/components/Button';
import { BrandScreen } from '@shared/components/BrandScreen';
import { TextField } from '@shared/components/TextField';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';

type Verification = {
  site: {
    name: string;
    code: string;
    status: string;
    river: string | null;
    province: string | null;
    project: string | null;
    operator: string | null;
  };
  permits: { type: string; reference: string | null; issuing_authority: string | null; expires_on: string | null; valid: boolean }[];
  inspections: { agency: string; inspected_on: string; outcome: string }[];
};

/**
 * What a scanned site board says. The token is typed for now — a camera scanner
 * needs a native module the current build does not carry — but the endpoint and
 * the payload are the same ones the printed QR resolves to.
 */
export function VerifyScreen() {
  const { scheme } = useTheme();
  const [token, setToken] = useState('');
  const [result, setResult] = useState<Verification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.get<{ data: Verification }>(`/verify/${token.trim()}`);
      setResult(data.data);
    } catch {
      setError('No site answers to that code. Check the board and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandScreen title="Verify a site" subtitle="Anyone can check a board">
      <View style={{ gap: 16, paddingVertical: 18 }}>
        <TextField
          label="Code from the board"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          placeholder="Paste or type the code"
        />
        <Button label="Verify" onPress={verify} loading={loading} disabled={token.trim().length === 0} />

        {error ? <Text style={{ color: scheme.danger, fontSize: 14 }}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={scheme.textMuted} /> : null}

        {result ? (
          <View
            style={{
              backgroundColor: scheme.surface,
              borderColor: brand.deepLeaf,
              borderWidth: 2,
              borderRadius: 14,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={{ color: scheme.text, fontSize: 18, fontWeight: '700' }}>{result.site.name}</Text>
            <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
              {[result.site.code, result.site.river, result.site.province].filter(Boolean).join(' · ')}
            </Text>
            <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
              {[result.site.project, result.site.operator].filter(Boolean).join(' — operated by ')}
            </Text>

            <Text style={{ color: scheme.text, fontSize: 14, fontWeight: '700', marginTop: 6 }}>Permits</Text>
            {result.permits.length ? (
              result.permits.map((permit) => (
                <Text key={`${permit.type}-${permit.reference}`} style={{ color: scheme.textMuted, fontSize: 13 }}>
                  {permit.type} · {permit.valid ? 'valid' : 'expired'}
                  {permit.expires_on ? ` until ${permit.expires_on}` : ''}
                </Text>
              ))
            ) : (
              <Text style={{ color: scheme.textMuted, fontSize: 13 }}>None on record.</Text>
            )}

            <Text style={{ color: scheme.text, fontSize: 14, fontWeight: '700', marginTop: 6 }}>Inspections</Text>
            {result.inspections.length ? (
              result.inspections.map((inspection) => (
                <Text key={inspection.inspected_on} style={{ color: scheme.textMuted, fontSize: 13 }}>
                  {inspection.agency} · {inspection.inspected_on} · {inspection.outcome}
                </Text>
              ))
            ) : (
              <Text style={{ color: scheme.textMuted, fontSize: 13 }}>None on record.</Text>
            )}
          </View>
        ) : null}
      </View>
    </BrandScreen>
  );
}
