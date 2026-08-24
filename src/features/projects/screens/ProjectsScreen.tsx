import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandScreen } from '@shared/components/BrandScreen';
import type { MoreStackParamList } from '@navigation/types';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import { fetchProjects, type ProjectSummary } from '../api';

type Props = NativeStackScreenProps<MoreStackParamList, 'Projects'>;

export function ProjectsScreen({ navigation }: Props) {
  const { scheme } = useTheme();
  const organisationSlug = useAuthStore((state) => state.organisationSlug);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['projects', organisationSlug],
    queryFn: () => fetchProjects(organisationSlug!),
    enabled: Boolean(organisationSlug),
  });

  return (
    <BrandScreen title="Projects" subtitle={data ? `${data.length} in ${organisationSlug ?? "this organisation"}` : undefined}>
      <ScrollView
        contentContainerStyle={{ gap: 14, paddingVertical: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        {isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {data?.map((project: ProjectSummary) => (
          <Pressable
            key={project.id}
            onPress={() => navigation.navigate('ProjectDetail', { slug: project.slug, name: project.name })}
            style={{
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: scheme.text, fontSize: 16, fontWeight: '600' }}>{project.name}</Text>
              <Text style={{ color: scheme.textMuted, fontSize: 13 }}>
                {[project.code, project.status_label].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <ChevronRight color={scheme.textMuted} size={20} />
          </Pressable>
        ))}

        {data?.length === 0 ? (
          <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
            No projects in this organisation yet.
          </Text>
        ) : null}
      </ScrollView>
    </BrandScreen>
  );
}
