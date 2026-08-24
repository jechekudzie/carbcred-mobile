import { useColorScheme } from 'react-native';
import { dark, light, type Scheme } from './colors';

/**
 * The palette for the phone's current appearance. Dark mode is not a setting
 * the user hunts for — it follows the device, as it does everywhere else.
 */
export function useTheme(): { scheme: Scheme; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';

  return { scheme: isDark ? dark : light, isDark };
}
