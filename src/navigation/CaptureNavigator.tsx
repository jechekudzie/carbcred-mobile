import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CaptureScreen } from '@features/capture/screens/CaptureScreen';
import { CaptureMenuScreen } from '@features/capture/screens/CaptureMenuScreen';
import { DailyWashScreen } from '@features/capture/screens/DailyWashScreen';
import type { CaptureStackParamList } from './types';

const Stack = createNativeStackNavigator<CaptureStackParamList>();

export function CaptureNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CaptureMenu" component={CaptureMenuScreen} />
      <Stack.Screen name="DailyWash" component={DailyWashScreen} />
      <Stack.Screen name="FieldSubmission" component={CaptureScreen} />
    </Stack.Navigator>
  );
}
