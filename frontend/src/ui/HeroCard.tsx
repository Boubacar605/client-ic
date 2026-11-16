import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { Mission } from '../api/types';
import { metierDef } from '../data/metiers';
import { METIER_PHOTOS } from '../data/metierPhotos';
import { fcfa, fdate } from '../lib/format';
import { radius } from '../theme/tokens';
import { AppText } from './AppText';

// Grande carte avec l'image du métier derrière, comme les cartes « Centre équestre » de DakarGo.
export function HeroCard({ mission, width, onPress }: { mission: Mission; width: number; onPress: () => void }) {
  const def = metierDef(mission.metier);
  const photo = def ? METIER_PHOTOS[def.nom] : undefined;
  const couleur = def?.couleur ?? '#0f6b5c';
  const places = mission.postesRestants ?? mission.nombrePostes;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${mission.metier} à ${mission.zone}`} onPress={onPress}
      style={({ pressed }) => [s.card, { width, backgroundColor: couleur, opacity: pressed ? 0.92 : 1 }]}>
      {photo ? <Image source={photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
        : <MaterialCommunityIcons name={def?.icon ?? 'briefcase'} size={190} color="rgba(255,255,255,0.22)" style={s.bgIcon} />}
      <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.78)']} style={StyleSheet.absoluteFill} />
      <View style={s.top}>
        <View style={s.badge}><AppText variant="caption" color="#0f3d2e" style={{ fontWeight: '700' }}>{places} poste{places > 1 ? 's' : ''}</AppText></View>
        {mission.urgente && <View style={[s.badge, { backgroundColor: '#f2b705' }]}><AppText variant="caption" color="#14201c" style={{ fontWeight: '800' }}>Urgent</AppText></View>}
      </View>
      <View style={s.bottom}>
        <AppText variant="title" color="#ffffff" numberOfLines={1}>{mission.metier}</AppText>
        <AppText color="rgba(255,255,255,0.85)" numberOfLines={1}>{mission.zone}, {fdate(mission.date)}</AppText>
        <View style={s.row}>
          <View style={s.cta}><AppText variant="label" color="#0f3d2e">Voir la mission</AppText><Ionicons name="arrow-forward" size={18} color="#0f3d2e" /></View>
          <AppText variant="label" color="#ffffff">{fcfa(mission.remunerationFcfa)}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { height: 250, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'space-between', padding: 16 },
  bgIcon: { position: 'absolute', right: -20, top: 10 },
  top: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#d9efe3', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  bottom: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
});
