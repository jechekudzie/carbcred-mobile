import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@shared/components/Button';
import { BrandScreen } from '@shared/components/BrandScreen';
import { TextField } from '@shared/components/TextField';
import { clientRef } from '@features/capture/clientRef';
import { useQueueStore } from '@features/capture/queue';
import type { RiversStackParamList, SiteLogKind } from '@navigation/types';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';

type Props = NativeStackScreenProps<RiversStackParamList, 'SiteLog'>;

const TITLES: Record<SiteLogKind, string> = {
  'wash-reading': 'Daily wash',
  attendance: 'Attendance',
  inspection: 'Inspection',
  complaint: 'Complaint',
};

/**
 * A log kept at a site. Which site is already settled by how you got here —
 * River → Site → this — so the form never asks again, and the endpoint it files
 * to is fixed before a single field is typed.
 */
export function SiteLogScreen({ route, navigation }: Props) {
  const { scheme } = useTheme();
  const slug = useAuthStore((state) => state.organisationSlug);
  const enqueue = useQueueStore((state) => state.enqueue);
  const { siteId, siteName, kind } = route.params;

  const [fields, setFields] = useState<Record<string, string>>({});
  const set = (key: string) => (value: string) => setFields((current) => ({ ...current, [key]: value }));
  const value = (key: string) => fields[key] ?? '';

  const today = new Date().toISOString().slice(0, 10);

  const build = (): { endpoint: string; payload: Record<string, unknown>; label: string } | null => {
    const base = `/organisations/${slug}/sites/${siteId}`;

    if (kind === 'wash-reading') {
      if (!value('tonnes') || Number(value('hours')) <= 0) {
        return null;
      }

      return {
        endpoint: `${base}/readings`,
        label: 'Wash reading',
        payload: {
          reading_date: today,
          tonnes_processed: Number(value('tonnes')),
          hours_run: Number(value('hours')),
          ...(value('downtime') ? { downtime_hours: Number(value('downtime')) } : {}),
          ...(value('notes') ? { notes: value('notes') } : {}),
        },
      };
    }

    if (kind === 'attendance') {
      if (!value('name').trim() || !value('role').trim()) {
        return null;
      }

      return {
        endpoint: `${base}/attendance`,
        label: 'Attendance',
        payload: { attended_on: today, name: value('name').trim(), role: value('role').trim() },
      };
    }

    if (kind === 'inspection') {
      if (!value('agency').trim() || !value('outcome').trim()) {
        return null;
      }

      return {
        endpoint: `${base}/inspections`,
        label: 'Inspection',
        payload: {
          agency: value('agency').trim(),
          inspected_on: today,
          outcome: value('outcome').trim(),
          ...(value('inspector') ? { inspector: value('inspector').trim() } : {}),
          ...(value('findings') ? { findings: value('findings').trim() } : {}),
        },
      };
    }

    if (!value('description').trim()) {
      return null;
    }

    return {
      endpoint: `${base}/complaints`,
      label: 'Complaint',
      payload: {
        description: value('description').trim(),
        severity: value('severity').trim() || 'medium',
        ...(value('reporter') ? { reporter_name: value('reporter').trim() } : {}),
      },
    };
  };

  const ready = build() !== null;

  const file = async () => {
    const write = build();

    if (!write) {
      return;
    }

    await enqueue({
      kind,
      endpoint: write.endpoint,
      label: write.label,
      context: siteName,
      payload: { client_ref: clientRef(), ...write.payload },
    });

    Alert.alert('Logged', 'Saved on the phone. It files itself when you have signal.');
    navigation.goBack();
  };

  return (
    <BrandScreen title={TITLES[kind]} subtitle={siteName}>
      <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 18 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{today}</Text>

        {kind === 'wash-reading' ? (
          <>
            <TextField label="Tonnes processed" value={value('tonnes')} onChangeText={set('tonnes')} keyboardType="decimal-pad" placeholder="1730" />
            <TextField label="Hours run" value={value('hours')} onChangeText={set('hours')} keyboardType="decimal-pad" placeholder="10" />
            <TextField label="Downtime hours" value={value('downtime')} onChangeText={set('downtime')} keyboardType="decimal-pad" placeholder="0" />
            <TextField label="Notes" value={value('notes')} onChangeText={set('notes')} placeholder="Anything unusual" multiline />
          </>
        ) : null}

        {kind === 'attendance' ? (
          <>
            <TextField label="Name" value={value('name')} onChangeText={set('name')} placeholder="Who is here" />
            <TextField label="Role" value={value('role')} onChangeText={set('role')} placeholder="Eco-ranger" />
          </>
        ) : null}

        {kind === 'inspection' ? (
          <>
            <TextField label="Agency" value={value('agency')} onChangeText={set('agency')} placeholder="EMA" />
            <TextField label="Outcome" value={value('outcome')} onChangeText={set('outcome')} placeholder="As recorded on the notice" />
            <TextField label="Inspector" value={value('inspector')} onChangeText={set('inspector')} placeholder="Optional" />
            <TextField label="Findings" value={value('findings')} onChangeText={set('findings')} placeholder="Optional" multiline />
          </>
        ) : null}

        {kind === 'complaint' ? (
          <>
            <TextField label="What was reported" value={value('description')} onChangeText={set('description')} placeholder="In their words" multiline />
            <TextField label="Severity" value={value('severity')} onChangeText={set('severity')} placeholder="low, medium or high" />
            <TextField label="Reported by" value={value('reporter')} onChangeText={set('reporter')} placeholder="Optional" />
          </>
        ) : null}

        <Button label="Log it" onPress={file} disabled={!ready} />
      </ScrollView>
    </BrandScreen>
  );
}
