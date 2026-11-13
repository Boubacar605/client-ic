import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Icône d'onglet : pleine quand l'onglet est actif, en contour sinon. */
export const tabIcon = (on: IconName, off: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) => <Ionicons name={focused ? on : off} size={24} color={color} />;

/** Barre flottante en pilule, centrée et bornée en largeur sur desktop. */
export function useTabScreenOptions() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(Math.max(width - 32, 280), 560);
  return {
    headerShown: false,
    tabBarActiveTintColor: t.onBrand,
    tabBarInactiveTintColor: t.muted,
    tabBarActiveBackgroundColor: t.brand,
    tabBarLabelStyle: { fontSize: 12, fontWeight: '700' as const },
    tabBarItemStyle: { borderRadius: 30, marginVertical: 6, marginHorizontal: 4 },
    tabBarStyle: {
      position: 'absolute' as const,
      left: (width - barWidth) / 2,
      width: barWidth,
      bottom: Math.max(insets.bottom, 12),
      height: 68,
      borderRadius: 34,
      backgroundColor: t.tabBar,
      borderTopWidth: 0,
      paddingBottom: 0,
      paddingTop: 0,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
  };
}
