import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RiverMapScreen } from '@features/rivers/screens/RiverMapScreen';
import { RiversScreen } from '@features/rivers/screens/RiversScreen';
import { SiteDetailScreen } from '@features/sites/screens/SiteDetailScreen';
import { SiteLogScreen } from '@features/sites/screens/SiteLogScreen';
import { SitesScreen } from '@features/sites/screens/SitesScreen';
import type { RiversStackParamList } from './types';

const Stack = createNativeStackNavigator<RiversStackParamList>();

/** River → its sites → one site → a log kept at that site. */
export function RiversNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiversList" component={RiversScreen} />
      <Stack.Screen name="RiverMap" component={RiverMapScreen} />
      <Stack.Screen name="RiverSites" component={SitesScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
      <Stack.Screen name="SiteLog" component={SiteLogScreen} />
    </Stack.Navigator>
  );
}
