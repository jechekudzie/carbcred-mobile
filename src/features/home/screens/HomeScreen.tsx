import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@api/client';
import { Screen } from '@shared/components/Screen';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';

type Insight = { tone: string; title: string; body: string; href: string | null };

type Dashboard = {
  stats: { organisations: number; members: number; modules: number };
  overview: {
    programmes: number;
    projects: number;
    active_workflows: number;
    open_tasks: number;
    open_requisitions: number;
    approved_spend: number;
  };
  insights: Insight[];
  tip: { title: string; body: string };
};

export function HomeScreen() {
  const { scheme } = useTheme();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<{ data: Dashboard }>('/dashboard')).data.data,
  });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ gap: 18, paddingVertical: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        <View style={{ gap: 4 }}>
          <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Welcome back</Text>
          <Text style={{ color: scheme.text, fontSize: 26, fontWeight: '700' }}>
            {user?.name ?? 'Field team'}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stat label="Projects" value={data?.overview.projects ?? 0} />
              <Stat label="Open tasks" value={data?.overview.open_tasks ?? 0} />
              <Stat label="Awaiting" value={data?.overview.open_requisitions ?? 0} />
            </View>

            <View style={{ gap: 10 }}>
              <Text style={{ color: scheme.text, fontSize: 18, fontWeight: '700' }}>Today's focus</Text>
              {data?.insights.length ? (
                data.insights.map((insight) => (
                  <View
                    key={insight.title}
                    style={{
                      backgroundColor: scheme.surface,
                      borderColor: scheme.border,
                      borderWidth: 1,
                      borderRadius: 14,
                      padding: 14,
                      gap: 4,
                    }}
                  >
                    <Text style={{ color: scheme.text, fontSize: 15, fontWeight: '600' }}>{insight.title}</Text>
                    <Text style={{ color: scheme.textMuted, fontSize: 14 }}>{insight.body}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Nothing needs attention right now.</Text>
              )}
            </View>

            {data?.tip ? (
              <View
                style={{
                  backgroundColor: scheme.accent,
                  borderRadius: 14,
                  padding: 16,
                  gap: 4,
                }}
              >
                <Text style={{ color: scheme.onPrimary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>
                  FIELD TIP
                </Text>
                <Text style={{ color: scheme.onPrimary, fontSize: 16, fontWeight: '700' }}>{data.tip.title}</Text>
                <Text style={{ color: scheme.onPrimary, fontSize: 14, opacity: 0.9 }}>{data.tip.body}</Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { scheme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: scheme.surface,
        borderColor: scheme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 2,
      }}
    >
      <Text style={{ color: scheme.text, fontSize: 24, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}
