import React from 'react';
import { StyleSheet, View } from 'react-native';
import { STATUT_CANDIDATURE } from '../lib/format';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function StatusChip({ statut }: { statut: string }) {
  const t = useTheme();
  const color = statut === 'CONFIRMEE' ? t.green : statut === 'SELECTIONNEE' ? t.amber : ['REFUSEE', 'ANNULEE', 'EXPIREE', 'RETIREE'].includes(statut) ? t.error : t.blue;
  return <View style={[s.c, { backgroundColor: color + '22' }]}><AppText variant="caption" color={color} style={{ fontWeight: '800' }}>{STATUT_CANDIDATURE[statut] ?? statut}</AppText></View>;
}
const s = StyleSheet.create({ c: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' } });
