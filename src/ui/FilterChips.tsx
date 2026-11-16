import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string; count?: number };

/** Filtres en pilules défilantes : tous les statuts restent accessibles sans écraser l'écran. */
export function FilterChips<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[s.chip, { borderColor: on ? t.brand : t.line, backgroundColor: on ? t.soft : t.card }]}>
            <AppText variant="caption" color={on ? t.brand : t.muted} style={on ? s.selected : undefined}>
              {o.count === undefined ? o.label : `${o.label} · ${o.count}`}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  selected: { fontWeight: '800' },
});
