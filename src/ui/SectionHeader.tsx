import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props = {
  title: string;
  caption?: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
};

/** Titre de section de dashboard : libellé, compteur, légende et action compacte. */
export function SectionHeader({ title, caption, count, actionLabel, onAction, action }: Props) {
  const t = useTheme();
  return (
    <View style={s.row}>
      <View style={s.texts}>
        <View style={s.titleRow}>
          <AppText variant="heading">{title}</AppText>
          {typeof count === 'number' ? (
            <View style={[s.badge, { backgroundColor: t.soft }]}>
              <AppText variant="caption" color={t.brand} style={{ fontWeight: '800' }}>{count}</AppText>
            </View>
          ) : null}
        </View>
        {caption ? <AppText variant="caption" muted>{caption}</AppText> : null}
      </View>
      {action ?? (actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10} onPress={onAction} style={s.action}>
          <AppText variant="caption" color={t.brand} style={{ fontWeight: '700' }}>{actionLabel}</AppText>
          <Ionicons name="chevron-forward" size={16} color={t.brand} />
        </Pressable>
      ) : null)}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { minWidth: 24, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, alignItems: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
