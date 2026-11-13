import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { metierDef } from '../data/metiers';
import { METIER_PHOTOS } from '../data/metierPhotos';
import { useTheme } from '../theme/useTheme';

// Vignette carrée d'un métier : la photo si elle existe, sinon l'icône colorée.
export function MetierThumb({ metier, size = 72, radius = 18 }: { metier: string; size?: number; radius?: number }) {
  const t = useTheme();
  const def = metierDef(metier);
  const photo = def ? METIER_PHOTOS[def.nom] : undefined;
  const couleur = def?.couleur ?? t.brand;
  return (
    <View style={[s.box, { width: size, height: size, borderRadius: radius, backgroundColor: couleur + '26' }]}>
      {photo ? <Image source={photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
        : <MaterialCommunityIcons name={def?.icon ?? 'briefcase'} size={size * 0.52} color={couleur} />}
    </View>
  );
}
const s = StyleSheet.create({ box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } });
