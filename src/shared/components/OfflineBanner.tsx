import { Text, View } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { useIsOnline } from '@shared/hooks/useIsOnline';
import { useQueueStore } from '@features/capture/queue';
import { brand } from '@theme/colors';

/**
 * Says plainly that what is on screen came from the phone, not the server.
 *
 * Cached data that looks live is worse than no data: someone acts on a figure
 * from Tuesday believing it is today's. So when there is no signal the app says
 * so, once, at the top of everything, and says what is still held on the phone.
 */
export function OfflineBanner() {
  const online = useIsOnline();
  const held = useQueueStore((state) => state.items.length);

  if (online) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#b06a00',
        paddingVertical: 7,
        paddingHorizontal: 16,
      }}
    >
      <CloudOff color={brand.cream} size={15} />
      <Text style={{ color: brand.cream, fontSize: 13, fontWeight: '600', flex: 1 }}>
        Offline — showing what this phone already has
        {held > 0 ? ` · ${held} to send` : ''}
      </Text>
    </View>
  );
}
