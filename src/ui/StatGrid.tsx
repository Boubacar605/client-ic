import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useResponsive } from '../lib/responsive';
import { AppText } from './AppText';

export interface StatItem {
  key: string;
  label: string;
  value: number | string | null | undefined;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: 'brand' | 'amber' | 'danger';
}

/** Bandeau de statistiques responsive : 2 colonnes sur mobile, jusqu'à 4 sur desktop. */
export function StatGrid({ items }: { items: StatItem[] }) {
  const t = useTheme();
  const { width } = useResponsive();
  const columns = width >= 1024 ? 4 : width >= 760 ? 3 : 2;
  const gap = 10;
  const cardWidth = (Math.min(width, 1120) - 40 - gap * (columns - 1)) / columns;
  const visible = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== '');
  if (!visible.length) return null;
  return (
    <View style={[s.grid, { gap }]}>
      {visible.map((item) => {
        const color = item.accent === 'amber' ? t.amber : item.accent === 'danger' ? '#c0392b' : t.brand;
        return (
          <View key={item.key} style={[s.card, { width: cardWidth, backgroundColor: t.card, borderColor: t.line }]}>
            {item.icon ? <Ionicons name={item.icon} size={20} color={color} /> : null}
            <AppText variant="title" color={color} numberOfLines={1}>{item.value}</AppText>
            <AppText variant="caption" muted numberOfLines={2}>{item.label}</AppText>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 4, overflow: 'hidden' },
});
