import { useColorScheme } from 'react-native';
import { dark, light, Theme } from './tokens';

// Suit automatiquement le mode du téléphone (clair ou sombre).
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
