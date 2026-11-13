import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

const HOURS = [...Array(17)].map((_, i) => `${String(i + 5).padStart(2, '0')}:00`); // 05:00 à 21:00

export function HourPicker({ label, value, onChange }: { label: string; value: string; onChange: (h: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label">{label}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {HOURS.map((h) => {
          const on = h === value;
          return (
            <Pressable key={h} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(h)}
              style={[s.h, { backgroundColor: on ? t.brand : t.card, borderColor: on ? t.brand : t.line }]}>
              <AppText variant="label" color={on ? t.onBrand : t.text}>{h}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({ h: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1.5 } });
