import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectDetailScreen } from '@features/projects/screens/ProjectDetailScreen';
import { ProjectsScreen } from '@features/projects/screens/ProjectsScreen';
import type { ProjectsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

/** A list that drills into one project's flow — the only depth this tab has. */
export function ProjectsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}
