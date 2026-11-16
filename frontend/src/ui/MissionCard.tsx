import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Mission } from '../api/types';
import { fcfa, fdate, HORAIRE, STATUT_MISSION } from '../lib/format';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { MetierThumb } from './MetierThumb';

// Une annonce : l'image du métier à gauche, l'essentiel à droite.
export function MissionCard({ mission, onPress }: { mission: Mission; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${mission.metier} à ${mission.zone}, ${fcfa(mission.remunerationFcfa)}`}
      onPress={onPress} style={({ pressed }) => [s.card, { backgroundColor: t.card, borderColor: t.line, opacity: pressed ? 0.92 : 1 }]}>
      <MetierThumb metier={mission.metier} size={78} radius={20} />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={s.row}>
          <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>{mission.metier}</AppText>
          {mission.urgente && <View style={[s.tag, { backgroundColor: t.sunSoft }]}><AppText variant="caption" color={t.amber} style={{ fontWeight: '800' }}>Urgent</AppText></View>}
        </View>
        <View style={s.row}><Ionicons name="location-outline" size={16} color={t.muted} /><AppText variant="caption" muted numberOfLines={1}>{mission.zone}{mission.recruteurNom ? `, ${mission.recruteurNom}` : ''}</AppText></View>
        <View style={s.row}><Ionicons name="calendar-outline" size={16} color={t.muted} /><AppText variant="caption" muted>{fdate(mission.date)}, {HORAIRE[mission.typeHoraire]}</AppText></View>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <AppText variant="label" color={t.brand}>{fcfa(mission.remunerationFcfa)}</AppText>
          <View style={[s.tag, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand} style={{ fontWeight: '700' }}>{STATUT_MISSION[mission.statut] ?? mission.statut}</AppText></View>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
});
