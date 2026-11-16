import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

// Grande carte à choisir : l'icône permet de comprendre sans lire.
export function ChoiceCard({ icon, title, subtitle, selected, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={[s.card, { borderColor: selected ? t.brand : t.line, backgroundColor: selected ? t.soft : t.card }]}
    >
      <View style={[s.icon, { backgroundColor: selected ? t.brand : t.soft }]}>
        <Ionicons name={icon} size={28} color={selected ? t.onBrand : t.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" muted>{subtitle}</AppText>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={26} color={t.brand} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.xl, borderWidth: 2 },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
