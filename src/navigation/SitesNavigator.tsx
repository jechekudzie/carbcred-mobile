import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SiteDetailScreen } from '@features/sites/screens/SiteDetailScreen';
import { SitesScreen } from '@features/sites/screens/SitesScreen';
import type { SitesStackParamList } from './types';

const Stack = createNativeStackNavigator<SitesStackParamList>();

export function SitesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SitesList" component={SitesScreen} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} />
    </Stack.Navigator>
  );
}
