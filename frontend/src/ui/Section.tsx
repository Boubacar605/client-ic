import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

// Un bloc de formulaire numéroté, avec son message d'erreur en rouge.
export function Section({ n, title, hint, error, children }: { n: number; title: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={s.head}>
        <View style={[s.num, { backgroundColor: error ? t.error : t.brand }]}><AppText variant="label" color={t.onBrand}>{n}</AppText></View>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{title}</AppText>
          {hint ? <AppText variant="caption" muted>{hint}</AppText> : null}
        </View>
      </View>
      {children}
      {error ? <AppText variant="caption" color={t.error} style={{ fontWeight: '700' }}>{error}</AppText> : null}
    </View>
  );
}
const s = StyleSheet.create({ head: { flexDirection: 'row', alignItems: 'center', gap: 10 }, num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } });
