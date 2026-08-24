import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import { useTheme } from '@theme/useTheme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

/**
 * One decision: is there a token? Everything else hangs off that, so there is
 * no way to end up half signed in.
 */
export function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const { scheme, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: scheme.background,
      card: scheme.surface,
      text: scheme.text,
      border: scheme.border,
      primary: scheme.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {token ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
