import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Icône d'onglet : pleine quand l'onglet est actif, en contour sinon. */
export const tabIcon = (on: IconName, off: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) => <Ionicons name={focused ? on : off} size={24} color={color} />;

type TabButtonProps = {
  children?: React.ReactNode;
  onPress?: (event: any) => void;
  onLongPress?: (event: any) => void;
  accessibilityState?: { selected?: boolean };
  accessibilityLabel?: string;
  testID?: string;
  style?: any;
};

/** Teinte translucide dérivée d'une couleur d'accent, pour un marqueur façon verre. */
const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/**
 * Marqueur actif en pilule : arrondi sur ses quatre coins quelle que soit la position
 * de l'onglet, y compris aux extrémités gauche et droite de la barre.
 */
const renderTabButton = (glass: string, glassLine: string) => function TabBarButton(props: TabButtonProps) {
  const focused = props.accessibilityState?.selected === true;
  return (
    <Pressable accessibilityRole="tab" accessibilityState={props.accessibilityState} accessibilityLabel={props.accessibilityLabel}
      testID={props.testID} onPress={props.onPress} onLongPress={props.onLongPress} style={[props.style, s.button]}>
      <View style={[s.pill, focused && { backgroundColor: glass, borderColor: glassLine }]}>{props.children}</View>
    </Pressable>
  );
};

/** Barre flottante en pilule, centrée et bornée en largeur sur desktop. */
export function useTabScreenOptions() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(Math.max(width - 32, 280), 560);
  return {
    headerShown: false,
    // Fond de scène aux couleurs de l'app : évite le flash blanc quand on change d'onglet.
    sceneStyle: { backgroundColor: t.bg },
    tabBarActiveTintColor: t.brand,
    tabBarInactiveTintColor: t.muted,
    // Icônes seules : aucun libellé dans la barre.
    tabBarShowLabel: false,
    tabBarButton: renderTabButton(withAlpha(t.brand, 0.16), withAlpha(t.brand, 0.34)),
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
      overflow: 'hidden' as const,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
  };
}

const s = StyleSheet.create({
  button: { flex: 1, marginVertical: 6, marginHorizontal: 4 },
  pill: { flex: 1, borderRadius: 28, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
