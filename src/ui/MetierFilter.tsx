import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { MetierThumb } from './MetierThumb';

// Bande de métiers à toucher, comme la bande de sports de DakarGo : une image par métier, « Tout » en premier.
export function MetierFilter({ metiers, value, onChange }: { metiers: string[]; value: string | null; onChange: (m: string | null) => void }) {
  const t = useTheme();
  const item = (key: string, label: string, on: boolean, onPress: () => void, visual: React.ReactNode) => (
    <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label} onPress={onPress} style={s.item}>
      <View style={[s.box, { borderColor: on ? t.brand : 'transparent' }]}>{visual}</View>
      <AppText variant="caption" color={on ? t.brand : t.muted} style={{ fontWeight: '700' }} numberOfLines={1}>{label}</AppText>
    </Pressable>
  );
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
      {item('tout', 'Tout', value === null, () => onChange(null),
        <View style={[s.all, { backgroundColor: t.brand }]}><Ionicons name="apps" size={26} color={t.onBrand} /></View>)}
      {metiers.map((m) => item(m, m, value === m, () => onChange(m), <MetierThumb metier={m} size={58} radius={17} />))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  item: { alignItems: 'center', gap: 4, width: 72 },
  box: { borderWidth: 2.5, borderRadius: 20, padding: 2 },
  all: { width: 58, height: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
