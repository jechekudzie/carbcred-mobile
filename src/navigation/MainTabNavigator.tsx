import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ListChecks, MapPin, MoreHorizontal, Plus } from 'lucide-react-native';
import { CaptureNavigator } from './CaptureNavigator';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { TasksScreen } from '@features/tasks/screens/TasksScreen';
import { usePermissions } from '@shared/hooks/usePermissions';
import { useAuthStore } from '@stores/authStore';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';
import { MoreNavigator } from './MoreNavigator';
import { RiversNavigator } from './RiversNavigator';

const Tab = createBottomTabNavigator();

/**
 * The tab bar is built from what this person can actually do in the
 * organisation they are working in — the API says so, in the permissions on
 * /me — rather than from a role name checked in here.
 *
 * Five tabs at most, and the same five wherever possible: a bar that gains and
 * loses entries as data arrives is disorienting. The two views that differ by
 * audience — the delivery pipeline and a contractor's own engagements — live
 * one tap into More rather than swapping places in the bar.
 */
export function MainTabNavigator() {
  const { scheme } = useTheme();
  const can = usePermissions();

  const captures = can('create-field') || can('edit-field') || can('edit-contractors') || can('edit-projects');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.deepLeaf,
        tabBarInactiveTintColor: scheme.textMuted,
        tabBarStyle: {
          backgroundColor: scheme.surface,
          borderTopColor: scheme.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />

      {/* River → Project → Site → its logs, walked in that order. */}
      <Tab.Screen
        name="Rivers"
        component={RiversNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }}
      />

      {captures ? (
        <Tab.Screen
          name="Capture"
          component={CaptureNavigator}
          options={{ tabBarIcon: ({ color, size }) => <Plus color={color} size={size} /> }}
        />
      ) : null}

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
      />

      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
