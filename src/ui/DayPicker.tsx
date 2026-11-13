import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { isoLocal } from '../lib/validation';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

// Sélecteur de jour en pastilles, comme la bande de dates de DakarGo : on touche, on n'écrit pas.
export function DayPicker({ value, onChange, days = 14 }: { value: string; onChange: (iso: string) => void; days?: number }) {
  const t = useTheme();
  const list = [...Array(days)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
      {list.map((d, i) => {
        const iso = isoLocal(d), on = iso === value;
        return (
          <Pressable key={iso} accessibilityRole="button" accessibilityState={{ selected: on }}
            accessibilityLabel={d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} onPress={() => onChange(iso)}
            style={[s.day, { backgroundColor: on ? t.brand : t.card, borderColor: on ? t.brand : t.line }]}>
            <AppText variant="caption" color={on ? t.onBrand : t.muted}>{i === 0 ? 'Auj.' : d.toLocaleDateString('fr-FR', { weekday: 'short' })}</AppText>
            <AppText variant="heading" color={on ? t.onBrand : t.text}>{d.getDate()}</AppText>
            <AppText variant="caption" color={on ? t.onBrand : t.muted}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const s = StyleSheet.create({ day: { width: 66, paddingVertical: 10, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1.5 } });
