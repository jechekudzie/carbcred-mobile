import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '@api/client';
import { BrandScreen } from '@shared/components/BrandScreen';
import { useTheme } from '@theme/useTheme';
import { decide, fetchInbox, TYPE_LABELS, type ApprovalItem, type ApprovalType } from '../api';

/**
 * One queue for everything awaiting this person, whichever organisation it
 * belongs to. The API decides what is in it; the app only groups and shows it.
 */
export function TasksScreen() {
  const { scheme } = useTheme();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ApprovalType | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['approvals', filter],
    queryFn: () => fetchInbox(filter ?? undefined),
  });

  const mutation = useMutation({
    mutationFn: ({ item, choice }: { item: ApprovalItem; choice: 'approve' | 'reject' }) =>
      decide(item.type, item.id, choice),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['approvals'] });
      Alert.alert('Done', result.message);
    },
    onError: (error) => Alert.alert('Not done', errorMessage(error, 'That decision did not go through.')),
  });

  const counts = data?.counts ?? {};

  return (
    <BrandScreen title="Tasks" subtitle={counts.total ? `${counts.total} awaiting you` : "Nothing is waiting on you"}>
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingVertical: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={scheme.textMuted} />}
      >
        {data?.types.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip label="All" count={counts.total ?? 0} selected={filter === null} onPress={() => setFilter(null)} />
            {data.types.map((type) => (
              <Chip
                key={type}
                label={TYPE_LABELS[type]}
                count={counts[type] ?? 0}
                selected={filter === type}
                onPress={() => setFilter(type)}
              />
            ))}
          </ScrollView>
        ) : null}

        {isLoading ? <ActivityIndicator color={scheme.textMuted} style={{ marginTop: 30 }} /> : null}

        {data?.items.map((item) => (
          <View
            key={`${item.type}-${item.id}`}
            style={{
              backgroundColor: scheme.surface,
              borderColor: scheme.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ gap: 3 }}>
              <Text style={{ color: scheme.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 }}>
                {item.awaiting.toUpperCase()}
                {item.organisation ? ` · ${item.organisation.name}` : ''}
              </Text>
              <Text style={{ color: scheme.text, fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={{ color: scheme.textMuted, fontSize: 13 }}>{item.subtitle}</Text>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.actions.includes('approve') ? (
                <Action
                  label="Approve"
                  tone={scheme.accent}
                  onPress={() => mutation.mutate({ item, choice: 'approve' })}
                  disabled={mutation.isPending}
                />
              ) : null}
              {item.actions.includes('reject') ? (
                <Action
                  label={(item.meta.reject_label as string) ?? 'Reject'}
                  tone={scheme.danger}
                  outline
                  onPress={() => mutation.mutate({ item, choice: 'reject' })}
                  disabled={mutation.isPending}
                />
              ) : null}
            </View>
          </View>
        ))}

        {data && data.items.length === 0 && !isLoading ? (
          <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Nothing in this queue.</Text>
        ) : null}
      </ScrollView>
    </BrandScreen>
  );
}

function Chip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { scheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected ? scheme.accent : scheme.surface,
        borderColor: selected ? scheme.accent : scheme.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: selected ? scheme.onPrimary : scheme.text, fontSize: 14, fontWeight: '600' }}>
        {label} {count > 0 ? `(${count})` : ''}
      </Text>
    </Pressable>
  );
}

function Action({
  label,
  tone,
  onPress,
  outline = false,
  disabled = false,
}: {
  label: string;
  tone: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
}) {
  const { scheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 11,
        borderRadius: 10,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: outline ? 'transparent' : tone,
        borderWidth: 1,
        borderColor: tone,
      }}
    >
      <Text style={{ color: outline ? tone : scheme.onPrimary, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
