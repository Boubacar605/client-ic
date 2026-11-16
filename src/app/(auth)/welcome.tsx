import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { listPublicFeed } from '../../api/missions';
import type { MetierIcon } from '../../data/metiers';
import { ACCUEIL_PHOTOS } from '../../data/photos';
import { fcfa, fdate, HORAIRE } from '../../lib/format';
import { AppText } from '../../ui/AppText';
import { Logo } from '../../ui/Logo';
import { MetierThumb } from '../../ui/MetierThumb';

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
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  // Feed public : un visiteur peut parcourir les annonces sans compte.
  const feed = useQuery({ queryKey: ['public-missions-feed'], queryFn: () => listPublicFeed(20), enabled: mounted, staleTime: 60_000 });
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

  // La section feed n'est rendue que s'il existe des missions publiées.
  const missions = feed.data ?? [];
  // Postuler exige un compte : un visiteur est envoyé vers la connexion.
  const goLogin = () => router.push('/login');
  const heroHeight = Math.max(Math.min(height * 0.58, 620), 400);

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
          </Animated.View>
        );
      })}

      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 130 }]} showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { height: heroHeight }]}>
          <View style={s.header}>
            <Logo size={40} />
            <AppText variant="heading" color="#ffffff">XeuySil</AppText>
          </View>

          <View style={{ flex: 1 }} />

          <View style={s.slideText}>
            {SLIDES.map((sl, k) => (
              <Animated.View key={sl.photo} pointerEvents="none" style={[StyleSheet.absoluteFill, s.slideInner, { opacity: fades[k] }]}>
                <AppText variant="display" color="#ffffff">{sl.titre}</AppText>
                <AppText color="rgba(255,255,255,0.88)">{sl.texte}</AppText>
              </Animated.View>
            ))}
          </View>

          <View style={s.dots}>
            {SLIDES.map((_, k) => <View key={k} style={[s.dot, { backgroundColor: k === dot ? '#f2b705' : 'rgba(255,255,255,0.4)', width: k === dot ? 26 : 8 }]} />)}
          </View>
        </View>

        {missions.length > 0 && (
          <View style={s.feed}>
            <View style={s.feedHead}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="heading" color="#ffffff">Missions publiées</AppText>
                <AppText variant="caption" color="rgba(255,255,255,0.72)">Répondez en un geste, près de chez vous.</AppText>
              </View>
              <View style={s.feedBadge}><AppText variant="caption" color="#f2b705" style={{ fontWeight: '800' }}>{missions.length}</AppText></View>
            </View>

            <View style={{ gap: 10 }}>
              {missions.map((m) => (
                <View key={m.id} style={s.missionCard}>
                  <MetierThumb metier={m.metier} size={58} radius={18} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <AppText variant="label" color="#ffffff" numberOfLines={1}>{m.metier} · {m.zone}</AppText>
                    <AppText variant="caption" color="rgba(255,255,255,0.72)" numberOfLines={1}>
                      {fdate(m.date)}{HORAIRE[m.typeHoraire] ? ` · ${HORAIRE[m.typeHoraire]}` : ''}{typeof m.postesRestants === 'number' ? ` · ${m.postesRestants} place${m.postesRestants > 1 ? 's' : ''}` : ''}
                    </AppText>
                    <AppText variant="label" color="#f2b705">{fcfa(m.remunerationFcfa)}</AppText>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Postuler à la mission ${m.metier} à ${m.zone}`} onPress={goLogin}
                    style={({ pressed }) => [s.apply, { opacity: pressed ? 0.85 : 1 }]}>
                    <AppText variant="caption" color="#14201c" style={{ fontWeight: '800' }}>Postuler</AppText>
                    <Ionicons name="arrow-forward" size={16} color="#14201c" />
                  </Pressable>
                </View>
              ))}
            </View>

            <AppText variant="caption" color="rgba(255,255,255,0.6)">Connectez-vous pour postuler et suivre vos candidatures.</AppText>
          </View>
        )}
      </ScrollView>

      <View pointerEvents="box-none" style={[s.footer, { bottom: insets.bottom + 20 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Commencer" onPress={goLogin}
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, width: '100%', maxWidth: 900, alignSelf: 'center' },
  hero: { justifyContent: 'space-between' },
  bgIcon: { position: 'absolute', alignSelf: 'center', top: '14%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slideText: { height: 140 },
  slideInner: { justifyContent: 'flex-end', gap: 10 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 16 },
  dot: { height: 8, borderRadius: 4 },
  feed: { marginTop: 22, gap: 12 },
  feedHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedBadge: { minWidth: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(242,183,5,0.16)', alignItems: 'center', justifyContent: 'center' },
  missionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 22, backgroundColor: 'rgba(20,32,28,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  apply: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f2b705', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  footer: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 24 },
  cta: { backgroundColor: '#f2b705', borderRadius: 999, minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, maxWidth: 852, width: '100%', alignSelf: 'center' },
});
