import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  trailing?: string | null;
  trailingColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  leading?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Ligne de liste homogène : visuel à gauche, informations au centre, état à droite. */
export function ListRow({ title, subtitle, meta, trailing, trailingColor, icon, leading, onPress, style }: Props) {
  const t = useTheme();
  const body = (
    <>
      {leading ?? (icon ? <View style={[s.icon, { backgroundColor: t.soft }]}><Ionicons name={icon} size={20} color={t.brand} /></View> : null)}
      <View style={s.texts}>
        <AppText variant="label" numberOfLines={1}>{title}</AppText>
        {subtitle ? <AppText variant="caption" muted numberOfLines={1}>{subtitle}</AppText> : null}
        {meta ? <AppText variant="caption" muted numberOfLines={1}>{meta}</AppText> : null}
      </View>
      {trailing || onPress ? (
        <View style={s.right}>
          {trailing ? <AppText variant="caption" color={trailingColor ?? t.brand} style={{ fontWeight: '700' }} numberOfLines={1}>{trailing}</AppText> : null}
          {onPress ? <Ionicons name="chevron-forward" size={18} color={t.muted} /> : null}
        </View>
      ) : null}
    </>
  );
  const base = [s.row, { backgroundColor: t.card, borderColor: t.line }, style];
  if (!onPress) return <View style={base}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1 }]}>{body}</Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '45%' },
});
