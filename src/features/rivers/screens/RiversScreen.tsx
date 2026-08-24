import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Map } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandScreen } from '@shared/components/BrandScreen';
import type { RiversStackParamList } from '@navigation/types';
import { useTheme } from '@theme/useTheme';
import { fetchRivers, type River } from '../api';

type Props = NativeStackScreenProps<RiversStackParamList, 'RiversList'>;

/**
 * The top of the hierarchy: River → Project → Site → its logs. Everything the
 * programme does happens on one of these five approved reaches, so this is
 * where a person starts when they are looking for somewhere rather than for
 * something.
 */
export function RiversScreen({ navigation }: Props) {
  const { scheme } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['rivers'],
    queryFn: fetchRivers,
    staleTime: 24 * 60 * 60 * 1000,
  });

  return (
    <BrandScreen title="Rivers" subtitle={data ? `${data.length} approved reaches` : undefined}>
      <ScrollView
        contentContainerStyle={{ gap: 12, paddingVertical: 18 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        {isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        <Pressable
          onPress={() => navigation.navigate('RiverMap')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#3b82f6',
            borderRadius: 14,
            padding: 16,
          }}
        >
          <Map color="#ffffff" size={22} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>See them on a map</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              Every reach, every site, and who is allocated where
            </Text>
          </View>
        </Pressable>

        {data?.map((river: River) => (
          <Pressable
            key={river.id}
            onPress={() => navigation.navigate('RiverSites', { riverId: river.id, name: river.name })}
            style={{
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderLeftWidth: 5,
              // A river is always drawn in its own blue, here as everywhere.
              borderLeftColor: river.color,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: scheme.text, fontSize: 16, fontWeight: '600' }}>{river.name} River</Text>
              <Text style={{ color: scheme.textMuted, fontSize: 13 }}>
                {river.province} · {river.sites_count} {river.sites_count === 1 ? 'site' : 'sites'} · {river.status}
              </Text>
            </View>
            <ChevronRight color={scheme.textMuted} size={20} />
          </Pressable>
        ))}
      </ScrollView>
    </BrandScreen>
  );
}
