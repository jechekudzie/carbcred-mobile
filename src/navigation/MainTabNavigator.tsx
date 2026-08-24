import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, MoreHorizontal, Plus } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { CaptureScreen } from '@features/capture/screens/CaptureScreen';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { Screen } from '@shared/components/Screen';
import { useTheme } from '@theme/useTheme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Placeholder until the capture slice lands. */
function ComingSoon({ title }: { title: string }) {
  const { scheme } = useTheme();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Text style={{ color: scheme.text, fontSize: 20, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: scheme.textMuted, fontSize: 14 }}>Next slice.</Text>
      </View>
    </Screen>
  );
}

export function MainTabNavigator() {
  const { scheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: scheme.primary,
        tabBarInactiveTintColor: scheme.textMuted,
        tabBarStyle: { backgroundColor: scheme.surface, borderTopColor: scheme.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Capture"
        component={CaptureScreen}
        options={{ tabBarIcon: ({ color, size }) => <Plus color={color} size={size} /> }}
      />
      <Tab.Screen
        name="More"
        options={{ tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }}
      >
        {() => <ComingSoon title="More" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
