import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandScreen } from '@shared/components/BrandScreen';
import type { RiversStackParamList } from '@navigation/types';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import { fetchSites, type SiteRow } from '../api';

type Props = NativeStackScreenProps<RiversStackParamList, 'RiverSites'>;

/** The sites on one river — the middle of River → Project → Site. */
export function SitesScreen({ navigation, route }: Props) {
  const { scheme } = useTheme();
  const slug = useAuthStore((state) => state.organisationSlug);
  const { riverId, name } = route.params;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['sites', slug, riverId ?? 'all'],
    queryFn: () => fetchSites(slug!, riverId ? { riverId } : {}),
    enabled: Boolean(slug),
  });

  return (
    <BrandScreen
      title={name ? `${name} River` : 'All sites'}
      subtitle={data ? `${data.length} ${data.length === 1 ? 'site' : 'sites'} in reach` : undefined}
    >
      <ScrollView
        contentContainerStyle={{ gap: 12, paddingVertical: 18 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        {isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {data?.map((site: SiteRow) => (
          <Pressable
            key={site.id}
            onPress={() => navigation.navigate('SiteDetail', { siteId: site.id, name: site.name })}
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
              <Text style={{ color: scheme.text, fontSize: 16, fontWeight: '600' }}>{site.name}</Text>
              <Text style={{ color: scheme.textMuted, fontSize: 13 }}>
                {[site.code, site.river, site.status].filter(Boolean).join(' · ')}
              </Text>
              {site.project ? (
                <Text style={{ color: scheme.textMuted, fontSize: 12 }}>
                  {site.project}
                  {site.operator ? ` · ${site.operator}` : ''}
                </Text>
              ) : null}
            </View>
            <ChevronRight color={scheme.textMuted} size={20} />
          </Pressable>
        ))}

        {data?.length === 0 ? (
          <Text style={{ color: scheme.textMuted, fontSize: 14 }}>
            {name
              ? 'No sites on this river are in reach of your organisation.'
              : 'No sites are in reach of your organisation.'}
          </Text>
        ) : null}
      </ScrollView>
    </BrandScreen>
  );
}
