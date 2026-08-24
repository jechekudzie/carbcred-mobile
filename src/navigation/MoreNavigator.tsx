import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EngagementsScreen } from '@features/engagements/screens/EngagementsScreen';
import { EmergencyScreen } from '@features/more/screens/EmergencyScreen';
import { MoreScreen } from '@features/more/screens/MoreScreen';
import { VerifyScreen } from '@features/more/screens/VerifyScreen';
import type { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="Engagements" component={EngagementsScreen} />
    </Stack.Navigator>
  );
}
