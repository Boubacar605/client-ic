import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props<T extends string> = { options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void };

// Choix unique en pastilles qui passent à la ligne (zones, types...).
export function ChipGroup<T extends string>({ options, value, onChange }: Props<T>) {
  const t = useTheme();
  return (
    <View style={s.wrap}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)}
            style={[s.chip, { backgroundColor: on ? t.brand : t.card, borderColor: on ? t.brand : t.line }]}>
            <AppText variant="label" color={on ? t.onBrand : t.text}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1.5 },
});
