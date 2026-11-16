import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function Stepper({ value, onChange, min = 1, max = 50 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const t = useTheme();
  const btn = (icon: 'remove' | 'add', next: number, label: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => onChange(Math.min(max, Math.max(min, next)))}
      style={[s.btn, { backgroundColor: t.soft }]}><Ionicons name={icon} size={28} color={t.brand} /></Pressable>
  );
  return (
    <View style={s.row}>
      {btn('remove', value - 1, 'Moins')}
      <View style={{ minWidth: 70, alignItems: 'center' }}><AppText variant="display">{value}</AppText><AppText variant="caption" muted>personne{value > 1 ? 's' : ''}</AppText></View>
      {btn('add', value + 1, 'Plus')}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  btn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
