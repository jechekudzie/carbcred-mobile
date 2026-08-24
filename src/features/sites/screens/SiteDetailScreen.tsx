import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Check, Circle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart } from '@shared/components/BarChart';
import { BrandScreen } from '@shared/components/BrandScreen';
import type { SitesStackParamList } from '@navigation/types';
import { useAuthStore } from '@stores/authStore';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';
import { fetchSite, MOBILIZATION_STEPS, type Mobilization } from '../api';

type Props = NativeStackScreenProps<SitesStackParamList, 'SiteDetail'>;

/**
 * Everything happening at one site, in the order it matters on the ground:
 * is it mobilised, is it guarded, who is here today, is it washing, has the
 * regulator been, and is anyone complaining.
 */
export function SiteDetailScreen({ route }: Props) {
  const { scheme } = useTheme();
  const slug = useAuthStore((state) => state.organisationSlug);
  const { siteId, name } = route.params;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['site', slug, siteId],
    queryFn: () => fetchSite(slug!, siteId),
    enabled: Boolean(slug),
  });

  const ops = data?.operations;
  const bars = (ops?.performance ?? []).slice(-10).map((row) => ({
    label: row.date.slice(5),
    actual: row.actual,
    expected: row.expected,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const hereToday = ops?.attendance.filter((entry) => entry.attended_on === today) ?? [];

  return (
    <BrandScreen
      title={name}
      subtitle={data ? [data.code, data.river, data.province].filter(Boolean).join(' · ') : undefined}
    >
      <ScrollView
        contentContainerStyle={{ gap: 14, paddingVertical: 18 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        {isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {ops ? (
          <>
            <Section title="Mobilization" hint={ops.mobilization?.stage ?? 'not started'}>
              {ops.mobilization ? (
                <View style={{ gap: 9 }}>
                  {MOBILIZATION_STEPS.map((step) => {
                    const stamped = ops.mobilization?.[step.key] as string | null;

                    return (
                      <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {stamped ? (
                          <Check color={brand.deepLeaf} size={17} strokeWidth={3} />
                        ) : (
                          <Circle color={scheme.textMuted} size={17} />
                        )}
                        <Text
                          style={{
                            color: stamped ? scheme.text : scheme.textMuted,
                            fontSize: 14,
                            flex: 1,
                            fontWeight: stamped ? '500' : '400',
                          }}
                        >
                          {step.label}
                        </Text>
                        <Text style={{ color: scheme.textMuted, fontSize: 12 }}>{stamped ?? '—'}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Not mobilised yet.</Text>
              )}
            </Section>

            <Section
              title="Security"
              hint={
                ops.mobilization
                  ? `${ops.guards.length} of ${ops.mobilization.required_guards} on duty`
                  : `${ops.guards.length} on duty`
              }
            >
              {ops.guards.length ? (
                ops.guards.map((guard) => (
                  <Row
                    key={guard.id}
                    title={guard.name}
                    detail={`${guard.stage} · since ${guard.deployed_on}`}
                  />
                ))
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Nobody deployed.</Text>
              )}
              {ops.mobilization && ops.guards.length < ops.mobilization.required_guards ? (
                <Text style={{ color: scheme.danger, fontSize: 13, fontWeight: '600' }}>
                  {ops.mobilization.required_guards - ops.guards.length} short of the staged requirement.
                </Text>
              ) : null}
            </Section>

            <Section title="On the ground today" hint={`${hereToday.length} people`}>
              {hereToday.length ? (
                hereToday.map((entry) => <Row key={entry.id} title={entry.name} detail={entry.role} />)
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
                  Nobody recorded today{ops.attendance.length ? ` · last on ${ops.attendance[0].attended_on}` : ''}.
                </Text>
              )}
            </Section>

            <Section title="Wash performance" hint={ops.rated_tph ? `${ops.rated_tph} t/h rated` : undefined}>
              <BarChart bars={bars} height={100} />
            </Section>

            <Section title="Inspections" hint={`${ops.inspections.length} on record`}>
              {ops.inspections.length ? (
                ops.inspections.map((inspection) => (
                  <Row
                    key={inspection.id}
                    title={`${inspection.agency} · ${inspection.outcome}`}
                    detail={[inspection.inspected_on, inspection.follow_up].filter(Boolean).join(' · ')}
                  />
                ))
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>No visits recorded.</Text>
              )}
            </Section>

            <Section title="Complaints" hint={ops.open_complaints ? `${ops.open_complaints} open` : 'none open'}>
              {ops.complaints.length ? (
                ops.complaints.map((complaint) => (
                  <Row
                    key={complaint.id}
                    title={complaint.description}
                    detail={`${complaint.reference} · ${complaint.severity} · ${complaint.status}`}
                  />
                ))
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Nothing reported.</Text>
              )}
            </Section>

            <Section title="Representatives" hint={`${ops.representatives.length}`}>
              {ops.representatives.length ? (
                ops.representatives.map((person) => (
                  <Row
                    key={person.id}
                    title={person.name}
                    detail={[person.designation, person.body].filter(Boolean).join(' · ')}
                  />
                ))
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
                  No community representatives chosen for this site.
                </Text>
              )}
            </Section>
          </>
        ) : null}
      </ScrollView>
    </BrandScreen>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const { scheme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: scheme.surface,
        borderColor: scheme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: scheme.text, fontSize: 17, fontWeight: '700', flex: 1 }}>{title}</Text>
        {hint ? <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Row({ title, detail }: { title: string; detail: string }) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 1 }}>
      <Text style={{ color: scheme.text, fontSize: 14 }}>{title}</Text>
      <Text style={{ color: scheme.textMuted, fontSize: 12 }}>{detail}</Text>
    </View>
  );
}
