import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import { fetchInbox, type ApprovalItem } from '@features/tasks/api';
import { BarChart } from '@shared/components/BarChart';
import { BrandScreen } from '@shared/components/BrandScreen';
import { usePermissions } from '@shared/hooks/usePermissions';
import { useAuthStore } from '@stores/authStore';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';
import { fetchDashboard, fetchFocusForContractor, fetchFocusForDelivery } from '../api';

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
  const can = usePermissions();

  const seesDelivery = can('view-projects');

  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
  const inbox = useQuery({ queryKey: ['approvals', null], queryFn: () => fetchInbox() });

  const focus = useQuery({
    queryKey: ['focus', slug, seesDelivery],
    queryFn: () => (seesDelivery ? fetchFocusForDelivery(slug!) : fetchFocusForContractor(slug!)),
    enabled: Boolean(slug),
  });

  const project = focus.data;

  // The project's own work, not the organisation's admin. A head-office
  // requisition is somebody's job, but it is not this project's process.
  const projectActions = (inbox.data?.items ?? []).filter(
    (item: ApprovalItem) =>
      project?.projectId != null && (item.meta.project_id as number | null) === project.projectId,
  );

  const bars = (project?.performance ?? []).slice(-10).map((row) => ({
    label: row.date.slice(5),
    actual: row.actual,
    expected: row.expected,
  }));
  const latest = project?.performance.at(-1);

  const refresh = () => {
    void dashboard.refetch();
    void inbox.refetch();
    void focus.refetch();
  };

  return (
    <BrandScreen
      title={user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome back'}
      subtitle={project?.projectName ?? 'CarbCred Africa'}
      header={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <HeaderStat
            label="Phase"
            value={project?.phases ? `${project.phases.done}/${project.phases.total}` : '—'}
          />
          <HeaderStat label="Sites" value={String(project?.siteCount ?? 0)} />
          <HeaderStat label="On you" value={String(inbox.data?.counts.total ?? 0)} />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingVertical: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={dashboard.isRefetching} onRefresh={refresh} tintColor={scheme.textMuted} />
        }
      >
        {focus.isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {/* Where the project is in its process. */}
        {project?.phases ? (
          <Card>
            <CardTitle
              title="Process"
              hint={`${Math.round((project.phases.done / Math.max(project.phases.total, 1)) * 100)}%`}
              onPress={() => navigation.navigate('More')}
            />
            <View style={{ height: 8, borderRadius: 4, backgroundColor: scheme.border, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${(project.phases.done / Math.max(project.phases.total, 1)) * 100}%`,
                  height: 8,
                  backgroundColor: brand.deepLeaf,
                }}
              />
            </View>
            <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
              {project.phases.done} of {project.phases.total} phases complete
              {project.phases.current ? ` · now on ${project.phases.current}` : ''}
            </Text>
          </Card>
        ) : null}

        {/* The daily number the operation is judged on. */}
        {bars.length > 0 ? (
          <Card>
            <CardTitle title="Daily wash" hint={project?.siteName ?? undefined} />
            <BarChart bars={bars} />
            {latest ? (
              <View style={{ flexDirection: 'row', gap: 18 }}>
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

        {projectActions.length > 0 ? (
          <Card>
            <CardTitle
              title="Action items"
              hint={`${projectActions.length} on this project`}
              onPress={() => navigation.navigate('Tasks')}
            />
            {projectActions.slice(0, 4).map((item) => (
              <View key={`${item.type}-${item.id}`} style={{ gap: 1 }}>
                <Text style={{ color: scheme.text, fontSize: 15, fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{item.awaiting}</Text>
              </View>
            ))}
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

function HeaderStat({ label, value }: { label: string; value: string }) {
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
