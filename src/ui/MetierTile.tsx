import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { metierDef } from '../data/metiers';
import { METIER_PHOTOS } from '../data/metierPhotos';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

type Props = { metier: string; selected?: boolean; onPress?: () => void; width: number };

// Tuile d'un métier : photo si elle existe, sinon grande icône colorée. Le nom est toujours écrit dessous.
export function MetierTile({ metier, selected, onPress, width }: Props) {
  const t = useTheme();
  const def = metierDef(metier);
  const photo = def ? METIER_PHOTOS[def.nom] : undefined;
  const couleur = def?.couleur ?? t.brand;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={metier} accessibilityState={{ selected: !!selected }} onPress={onPress}
      style={({ pressed }) => [s.tile, { width, height: width, borderColor: selected ? t.brand : 'transparent', opacity: pressed ? 0.9 : 1, backgroundColor: couleur + '26' }]}
    >
      {photo ? <Image source={photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
        : <View style={s.iconWrap}><MaterialCommunityIcons name={def?.icon ?? 'briefcase'} size={width * 0.42} color={couleur} /></View>}
      <View style={[s.label, { backgroundColor: photo ? 'rgba(0,0,0,0.45)' : 'transparent' }]}>
        <AppText variant="label" color={photo ? '#ffffff' : t.text} numberOfLines={1}>{metier}</AppText>
      </View>
      {selected && <View style={[s.check, { backgroundColor: t.brand }]}><Ionicons name="checkmark" size={18} color={t.onBrand} /></View>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: { borderRadius: radius.xl, borderWidth: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  iconWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingBottom: 18 },
  label: { paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center' },
  check: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
