import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react-native';
import { Button } from '@shared/components/Button';
import { Screen } from '@shared/components/Screen';
import { TextField } from '@shared/components/TextField';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import { fetchSites } from '../api';
import { clientRef } from '../clientRef';
import { useQueueStore } from '../queue';
import type { SubmissionType } from '../types';

const TYPES: { value: SubmissionType; label: string }[] = [
  { value: 'planting', label: 'Planting' },
  { value: 'survival', label: 'Survival' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'incident', label: 'Incident' },
];

export function CaptureScreen() {
  const { scheme } = useTheme();
  const organisationSlug = useAuthStore((state) => state.organisationSlug);
  const enqueue = useQueueStore((state) => state.enqueue);
  const queued = useQueueStore((state) => state.items);

  const [siteId, setSiteId] = useState<number | null>(null);
  const [type, setType] = useState<SubmissionType>('planting');
  const [notes, setNotes] = useState('');
  const [species, setSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites', organisationSlug],
    queryFn: () => fetchSites(organisationSlug!),
    enabled: Boolean(organisationSlug),
  });

  const takeLocation = async () => {
    setLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Location needed', 'A capture is worth much more with the coordinates it was taken at.');

        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } finally {
      setLocating(false);
    }
  };

  const file = async () => {
    const site = sites?.find((candidate) => candidate.id === siteId);

    if (!site) {
      return;
    }

    // The UUID is minted here, on the phone, before anything touches the
    // network — it is what makes a replayed sync safe.
    await enqueue(
      {
        client_ref: clientRef(),
        site_id: site.id,
        type,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        notes: notes.trim() || null,
        captured_at: new Date().toISOString(),
        ...(type === 'planting' && species.trim() && Number(quantity) > 0
          ? {
              planting: {
                species: species.trim(),
                quantity: Number(quantity),
                planted_on: new Date().toISOString().slice(0, 10),
              },
            }
          : {}),
      },
      site.name,
    );

    setNotes('');
    setSpecies('');
    setQuantity('');
    setCoords(null);

    Alert.alert('Queued', 'This capture is saved on the phone and will file itself when there is signal.');
  };

  const canFile = siteId !== null && (type !== 'planting' || (species.trim() !== '' && Number(quantity) > 0));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 20, paddingVertical: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 4 }}>
          <Text style={{ color: scheme.text, fontSize: 26, fontWeight: '700' }}>Capture</Text>
          <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
            Saved on the phone first — it files itself when you have signal.
          </Text>
        </View>

        {queued.length > 0 ? (
          <View
            style={{
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 6,
            }}
          >
            <Text style={{ color: scheme.text, fontWeight: '600', fontSize: 14 }}>
              {queued.length} waiting to send
            </Text>
            {queued.slice(0, 3).map((item) => (
              <Text key={item.payload.client_ref} style={{ color: scheme.textMuted, fontSize: 13 }}>
                {item.payload.type} · {item.siteName}
                {item.status === 'failed' && item.lastError ? ` — ${item.lastError}` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        <Field label="Site">
          {isLoading ? (
            <ActivityIndicator color={scheme.textMuted} />
          ) : (
            <View style={{ gap: 8 }}>
              {sites?.map((site) => (
                <Choice
                  key={site.id}
                  label={`${site.name} (${site.code})`}
                  selected={siteId === site.id}
                  onPress={() => setSiteId(site.id)}
                />
              ))}
              {sites?.length === 0 ? (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
                  No sites are in reach of this organisation yet.
                </Text>
              ) : null}
            </View>
          )}
        </Field>

        <Field label="What are you capturing?">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TYPES.map((option) => (
              <Choice
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onPress={() => setType(option.value)}
                compact
              />
            ))}
          </View>
        </Field>

        {type === 'planting' ? (
          <View style={{ gap: 16 }}>
            <TextField label="Species" value={species} onChangeText={setSpecies} placeholder="Msasa" />
            <TextField
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="500"
            />
          </View>
        ) : null}

        <Field label="Where">
          <Pressable
            onPress={takeLocation}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <MapPin color={coords ? scheme.accent : scheme.textMuted} size={18} />
            <Text style={{ color: coords ? scheme.text : scheme.textMuted, fontSize: 15 }}>
              {locating
                ? 'Finding you…'
                : coords
                  ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                  : 'Tap to record coordinates'}
            </Text>
          </Pressable>
        </Field>

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="What you saw"
          multiline
          numberOfLines={3}
          style={undefined}
        />

        <Button label="Queue this capture" onPress={file} disabled={!canFile} />
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: scheme.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      {children}
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const { scheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{
        backgroundColor: selected ? scheme.accent : scheme.surface,
        borderColor: selected ? scheme.accent : scheme.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 14,
        flexGrow: compact ? 0 : 1,
      }}
    >
      <Text style={{ color: selected ? scheme.onPrimary : scheme.text, fontSize: 15, fontWeight: selected ? '600' : '400' }}>
        {label}
      </Text>
    </Pressable>
  );
}
