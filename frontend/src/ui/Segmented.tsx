import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

// Choix en pilule, comme les onglets « Programme / Sites » de DakarGo.
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const t = useTheme();
  return (
    <View style={[s.wrap, { backgroundColor: t.bg, borderColor: t.line }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)}
            style={[s.item, { backgroundColor: on ? t.brand : 'transparent' }]}>
            <AppText variant="label" color={on ? t.onBrand : t.muted}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, borderWidth: 1 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.pill },
});
