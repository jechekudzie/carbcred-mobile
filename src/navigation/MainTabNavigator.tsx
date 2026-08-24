import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FolderKanban, HardHat, Home, ListChecks, MapPin, MoreHorizontal, Plus } from 'lucide-react-native';
import { CaptureNavigator } from './CaptureNavigator';
import { EngagementsScreen } from '@features/engagements/screens/EngagementsScreen';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { TasksScreen } from '@features/tasks/screens/TasksScreen';
import { useAuthStore } from '@stores/authStore';
import { brand } from '@theme/colors';
import { useTheme } from '@theme/useTheme';
import { MoreNavigator } from './MoreNavigator';
import { RiversNavigator } from './RiversNavigator';
import { ProjectsNavigator } from './ProjectsNavigator';

const Tab = createBottomTabNavigator();

/**
 * The tab bar is built from what this person can actually do in the
 * organisation they are working in — the API says so, in the permissions on
 * /me — rather than from a role name checked in here.
 *
 * In practice that means the CarbCred team gets Projects (the delivery
 * pipeline) and a contractor gets My projects (its own engagements), because
 * those are the two different jobs the same app serves. Nobody gets a tab that
 * would answer 403 when they opened it.
 */
export function MainTabNavigator() {
  const { scheme } = useTheme();
  const can = useAuthStore((state) => state.can);

  const seesDelivery = can('view-projects');
  const seesEngagements = can('view-contractors');
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

      {/* Delivery sees the pipeline; a contractor sees only its own engagements. */}
      {seesDelivery ? (
        <Tab.Screen
          name="Projects"
          component={ProjectsNavigator}
          options={{ tabBarIcon: ({ color, size }) => <FolderKanban color={color} size={size} /> }}
        />
      ) : null}

      {seesEngagements && !seesDelivery ? (
        <Tab.Screen
          name="Engagements"
          component={EngagementsScreen}
          options={{
            title: 'My projects',
            tabBarIcon: ({ color, size }) => <HardHat color={color} size={size} />,
          }}
        />
      ) : null}

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
