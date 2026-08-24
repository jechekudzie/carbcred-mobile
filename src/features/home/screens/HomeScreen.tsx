import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import { fetchInbox } from '@features/tasks/api';
import { BarChart } from '@shared/components/BarChart';
import { BrandScreen } from '@shared/components/BrandScreen';
import { ProportionBar } from '@shared/components/ProportionBar';
import { useAuthStore } from '@stores/authStore';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';
import { fetchCarbon, fetchDashboard, fetchLeadSitePerformance } from '../api';

/** The insight's own tone decides its stripe — the API is what ranks urgency. */
const TONE_COLOURS: Record<string, string> = {
  action: '#f97066',
  warning: '#f5a524',
  info: brand.deepLeaf,
  success: brand.leaf,
  tip: brand.leaf,
};

export function HomeScreen({ navigation }: { navigation: { navigate: (screen: string) => void } }) {
  const { scheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const slug = useAuthStore((state) => state.organisationSlug);
  const can = useAuthStore((state) => state.can);
  const organisation = useAuthStore((state) => state.currentOrganisation)();

  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
  const inbox = useQuery({ queryKey: ['approvals', null], queryFn: () => fetchInbox() });

  // Only ask for what this person is allowed to see: a 403 on the home screen
  // is noise, not information.
  const carbon = useQuery({
    queryKey: ['carbon', slug],
    queryFn: () => fetchCarbon(slug!),
    enabled: Boolean(slug) && can('view-carbon'),
  });
  const performance = useQuery({
    queryKey: ['lead-performance', slug],
    queryFn: () => fetchLeadSitePerformance(slug!),
    enabled: Boolean(slug) && can('view-projects'),
  });

  const refreshing = dashboard.isRefetching || inbox.isRefetching;
  const refresh = () => {
    void dashboard.refetch();
    void inbox.refetch();
    void carbon.refetch();
    void performance.refetch();
  };

  const actions = inbox.data?.items ?? [];
  const bars = (performance.data?.performance ?? []).slice(-10).map((row) => ({
    label: row.date.slice(5),
    actual: row.actual,
    expected: row.expected,
  }));
  const latest = performance.data?.performance.at(-1);

  return (
    <BrandScreen
      title={user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome back'}
      subtitle={organisation?.name ?? 'CarbCred Africa'}
      header={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <HeaderStat label="Projects" value={dashboard.data?.overview.projects ?? 0} />
          <HeaderStat label="Open tasks" value={dashboard.data?.overview.open_tasks ?? 0} />
          <HeaderStat label="Awaiting you" value={inbox.data?.counts.total ?? 0} />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingVertical: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={scheme.textMuted} />}
      >
        {dashboard.isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {/* Action items first: the things that stop if nobody acts. */}
        {actions.length > 0 ? (
          <Card>
            <CardTitle
              title="Action items"
              hint={`${actions.length} awaiting you`}
              onPress={() => navigation.navigate('Tasks')}
            />
            {actions.slice(0, 3).map((item) => (
              <View key={`${item.type}-${item.id}`} style={{ gap: 1 }}>
                <Text style={{ color: scheme.text, fontSize: 15, fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ color: scheme.textMuted, fontSize: 13 }}>
                  {item.awaiting}
                  {item.organisation ? ` · ${item.organisation.name}` : ''}
                </Text>
              </View>
            ))}
            {actions.length > 3 ? (
              <Text style={{ color: brand.deepLeaf, fontSize: 13, fontWeight: '600' }}>
                +{actions.length - 3} more in Tasks
              </Text>
            ) : null}
          </Card>
        ) : null}

        {bars.length > 0 ? (
          <Card>
            <CardTitle title="Wash performance" hint={performance.data?.siteName ?? undefined} />
            <BarChart bars={bars} />
            {latest ? (
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Metric label="Last day" value={`${latest.actual.toLocaleString()} t`} />
                <Metric label="Expected" value={latest.expected ? `${latest.expected.toLocaleString()} t` : '—'} />
                <Metric
                  label="Efficiency"
                  value={latest.efficiency !== null ? `${latest.efficiency}%` : '—'}
                  tone={latest.efficiency !== null && latest.efficiency >= 85 ? brand.deepLeaf : '#f5a524'}
                />
              </View>
            ) : null}
          </Card>
        ) : null}

        {carbon.data ? (
          <Card>
            <CardTitle title="Carbon" hint="tCO2e" />
            <ProportionBar
              unit="t"
              segments={[
                { label: 'Verified', value: carbon.data.summary.net_verified, colour: brand.deepLeaf },
                { label: 'Estimated', value: carbon.data.summary.net_estimated, colour: brand.leaf },
                { label: 'Credits issued', value: carbon.data.summary.credits_issued, colour: '#7c9a3f' },
              ]}
            />
          </Card>
        ) : null}

        {dashboard.data?.insights.length ? (
          <Text style={{ color: scheme.text, fontSize: 18, fontWeight: '700' }}>Today's focus</Text>
        ) : null}

        {dashboard.data?.insights.map((insight) => (
          <View
            key={insight.title}
            style={{
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderLeftWidth: 4,
              borderLeftColor: TONE_COLOURS[insight.tone] ?? brand.deepLeaf,
              borderRadius: 14,
              padding: 14,
              gap: 4,
            }}
          >
            <Text style={{ color: scheme.text, fontSize: 15, fontWeight: '600' }}>{insight.title}</Text>
            <Text style={{ color: scheme.textMuted, fontSize: 14, lineHeight: 20 }}>{insight.body}</Text>
          </View>
        ))}

        {dashboard.data?.tip ? (
          <View style={{ backgroundColor: brand.deepLeaf, borderRadius: 16, padding: 16, gap: 5 }}>
            <Text style={{ color: brand.leaf, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>FIELD TIP</Text>
            <Text style={{ color: brand.cream, fontSize: 17, fontWeight: '700' }}>{dashboard.data.tip.title}</Text>
            <Text style={{ color: brand.cream, fontSize: 14, opacity: 0.88, lineHeight: 20 }}>
              {dashboard.data.tip.body}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </BrandScreen>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { scheme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: scheme.surface,
        borderColor: scheme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}

function CardTitle({ title, hint, onPress }: { title: string; hint?: string; onPress?: () => void }) {
  const { scheme } = useTheme();

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: scheme.text, fontSize: 17, fontWeight: '700', flex: 1 }}>{title}</Text>
      {hint ? <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{hint}</Text> : null}
      {onPress ? <ChevronRight color={scheme.textMuted} size={18} /> : null}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const { scheme } = useTheme();

  return (
    <View style={{ gap: 1 }}>
      <Text style={{ color: tone ?? scheme.text, fontSize: 17, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: scheme.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(250, 247, 241, 0.10)',
        borderColor: 'rgba(166, 196, 67, 0.35)',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 1,
      }}
    >
      <Text style={{ color: brand.cream, fontSize: 22, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: brand.leaf, fontSize: 12, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
