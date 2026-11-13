import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getPublicMissionSummary } from '../../api/missions';
import type { MetierIcon } from '../../data/metiers';
import { ACCUEIL_PHOTOS } from '../../data/photos';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { Logo } from '../../ui/Logo';

type Slide = { photo: string; icon: MetierIcon; couleur: string; titre: string; texte: string };

const SLIDES: Slide[] = [
  { photo: 'accueil-1', icon: 'hammer-wrench', couleur: '#8a4b1f', titre: 'Du travail près de chez vous',
    texte: 'Maçons, menuisiers, jardiniers, lessiveuses… recevez les missions de votre quartier et répondez en un geste.' },
  { photo: 'accueil-2', icon: 'account-group', couleur: '#0f4d40', titre: 'Besoin de bras demain ?',
    texte: 'Publiez votre besoin en deux minutes. Nous prévenons les bons travailleurs, vous choisissez.' },
  { photo: 'accueil-3', icon: 'whatsapp', couleur: '#1f5a8a', titre: 'Pour tout le monde',
    texte: 'Application, WhatsApp ou appel d’un agent : chacun répond comme il peut.' },
];
const DELAY = 4500;

// Écran d'accueil toujours sombre et photographique (comme celui de DakarGo), quel que soit le mode du téléphone.
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const publicMissions = useQuery({ queryKey: ['public-mission-summary'], queryFn: getPublicMissionSummary, enabled: mounted });
  const fades = useRef(SLIDES.map((_, k) => new Animated.Value(k === 0 ? 1 : 0))).current;
  const current = useRef(0);
  const [dot, setDot] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      const prev = current.current;
      const next = (prev + 1) % SLIDES.length;
      current.current = next;
      setDot(next);
      Animated.parallel([
        Animated.timing(fades[prev], { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(fades[next], { toValue: 1, duration: 700, useNativeDriver: true }),
      ]).start();
    }, DELAY);
    return () => clearInterval(id);
  }, [fades]);

  return (
    <View style={s.root}>
      {SLIDES.map((sl, k) => {
        const photo = ACCUEIL_PHOTOS[sl.photo];
        return (
          <Animated.View key={sl.photo} pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fades[k], backgroundColor: sl.couleur }]}>
            {photo
              ? <Image source={photo} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : <MaterialCommunityIcons name={sl.icon} size={300} color="rgba(255,255,255,0.16)" style={s.bgIcon} />}
            <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.9)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
            <View style={[s.text, { bottom: insets.bottom + 150 }]}>
              <AppText variant="display" color="#ffffff">{sl.titre}</AppText>
              <AppText color="rgba(255,255,255,0.88)">{sl.texte}</AppText>
            </View>
          </Animated.View>
        );
      })}

      <View style={[s.header, { top: insets.top + 12 }]}>
        <Logo size={40} />
        <AppText variant="heading" color="#ffffff">XeuySil</AppText>
      </View>

      <View style={[s.footer, { bottom: insets.bottom + 24 }]}>
        <View style={s.dots}>
          {SLIDES.map((_, k) => <View key={k} style={[s.dot, { backgroundColor: k === dot ? '#f2b705' : 'rgba(255,255,255,0.4)', width: k === dot ? 26 : 8 }]} />)}
        </View>
        {publicMissions.data?.total > 0 ? (
          <Card style={s.missionStat}>
            <Ionicons name="briefcase-outline" size={22} color="#f2b705" />
            <View style={{ flex: 1 }}>
              <AppText variant="heading" color="#ffffff">{publicMissions.data.total} mission{publicMissions.data.total > 1 ? 's' : ''} disponible{publicMissions.data.total > 1 ? 's' : ''}</AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.78)">Près de chez vous</AppText>
            </View>
          </Card>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Commencer" onPress={() => router.push('/login')}
          style={({ pressed }) => [s.cta, { opacity: pressed ? 0.9 : 1 }]}>
          <AppText variant="heading" color="#14201c">Commencer</AppText>
          <Ionicons name="arrow-forward" size={24} color="#14201c" />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d1512' },
  bgIcon: { position: 'absolute', alignSelf: 'center', top: '14%' },
  text: { position: 'absolute', left: 24, right: 24, gap: 10 },
  header: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { position: 'absolute', left: 24, right: 24, gap: 18 },
  missionStat: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(20,32,28,0.82)', borderColor: 'rgba(255,255,255,0.2)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  cta: { backgroundColor: '#f2b705', borderRadius: 999, minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
});
