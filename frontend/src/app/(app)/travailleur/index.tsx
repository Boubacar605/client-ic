import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useCandidatures, useDashboard, useMission, useMissions } from '../../../api/hooks';
import { useReference } from '../../../api/reference';
import type { Candidature } from '../../../api/types';
import { useSession } from '../../../auth/session';
import { fcfa, fdate } from '../../../lib/format';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { HeroCard } from '../../../ui/HeroCard';
import { MetierFilter } from '../../../ui/MetierFilter';
import { MetierThumb } from '../../../ui/MetierThumb';
import { MissionCard } from '../../../ui/MissionCard';

const open = (router: ReturnType<typeof useRouter>, id: string) => router.push({ pathname: '/mission/[id]', params: { id } });

// « Vous êtes retenu » : l'action la plus urgente du travailleur passe avant tout le reste.
function Retenu({ c }: { c: Candidature }) {
  const t = useTheme();
  const router = useRouter();
  const m = useMission(c.missionId).data;
  return (
    <View style={[s.alert, { backgroundColor: t.sunSoft, borderColor: t.sun }]}>
      <MetierThumb metier={m?.metier ?? ''} size={56} radius={16} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" color={t.amber}>Vous êtes retenu !</AppText>
        <AppText numberOfLines={2}>{m ? `${m.metier} à ${m.zone}, ${fdate(m.date)}` : 'Une mission vous attend.'}</AppText>
      </View>
      <Button label="Confirmer" onPress={() => open(router, c.missionId)} />
    </View>
  );
}

function Prochaine({ c, width }: { c: Candidature; width: number }) {
  const router = useRouter();
  const m = useMission(c.missionId).data;
  return m ? <HeroCard mission={m} width={width} onPress={() => open(router, m.id)} /> : null;
}

export default function TravailleurAccueil() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profil } = useSession();
  const ref = useReference();
  const q = useMissions();
  const dash = useDashboard();
  const cq = useCandidatures();
  const [recherche, setRecherche] = useState('');
  const [metier, setMetier] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const prenom = (profil?.nom ?? '').split(' ')[0];
  const initiales = (profil?.nom ?? profil?.email ?? '?').split(/[ @]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const missions = q.data ?? [];
  const metiers = Array.from(new Set<string>(missions.map((m) => m.metier)));
  const f = recherche.trim().toLowerCase();
  const list = missions.filter((m) => (!metier || m.metier === metier) && `${m.metier} ${m.zone}`.toLowerCase().includes(f));
  const cands = cq.data ?? [];
  const retenus = cands.filter((c) => c.statut === 'SELECTIONNEE');
  const prochaine = cands.find((c) => c.statut === 'CONFIRMEE');
  const cardW = Math.min(width - 56, 420);
  const d = dash.data ?? {};
  const stats = [
    typeof d.missionsPending === 'number' && { k: 'a', v: d.missionsPending, l: 'À venir' },
    typeof d.missionsCompleted === 'number' && { k: 'b', v: d.missionsCompleted, l: 'Terminées' },
    typeof d.scoreFiabilite === 'number' && { k: 'c', v: `${Math.round(d.scoreFiabilite)} %`, l: 'Fiabilité' },
  ].filter(Boolean) as { k: string; v: number | string; l: string }[];
  const error = q.error ?? ref.error;
  const refresh = () => { q.refetch(); dash.refetch(); cq.refetch(); };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={[s.head, s.pad]}>
        <View style={{ flex: 1 }}>
          <AppText variant="display" numberOfLines={2}>Bonjour{prenom ? `, ${prenom}` : ''} !</AppText>
          <AppText muted>Les missions près de chez vous.</AppText>
        </View>
        <View style={[s.avatar, { backgroundColor: t.sun }]}><AppText variant="heading" color="#14201c">{initiales}</AppText></View>
      </View>

      {retenus.length > 0 && <View style={[s.pad, { gap: 10 }]}>{retenus.map((c) => <Retenu key={c.id} c={c} />)}</View>}

      {prochaine && (
        <View style={{ gap: 10 }}>
          <AppText variant="heading" style={s.pad}>Votre prochaine mission</AppText>
          <View style={s.pad}><Prochaine c={prochaine} width={Math.min(width - 40, 440)} /></View>
        </View>
      )}

      {stats.length > 0 && (
        <View style={[s.pad, s.stats]}>
          {stats.map((st) => (
            <View key={st.k} style={[s.stat, { backgroundColor: t.card, borderColor: t.line }]}>
              <AppText variant="title" color={t.brand}>{st.v}</AppText>
              <AppText variant="caption" muted>{st.l}</AppText>
            </View>
          ))}
        </View>
      )}

      <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
        <Ionicons name="search" size={22} color={t.muted} />
        <TextInput accessibilityLabel="Rechercher un métier ou un quartier" placeholder="Rechercher un métier, un quartier…"
          placeholderTextColor={t.muted} value={recherche} onChangeText={setRecherche} style={[s.input, { color: t.text }]} />
      </View>

      {metiers.length > 1 && <MetierFilter metiers={metiers} value={metier} onChange={setMetier} />}

      {(q.isLoading || ref.isLoading) && <View style={{ padding: 40 }}><ActivityIndicator color={t.brand} /></View>}

      {error && (
        <View style={s.pad}>
          <Card>
            <Ionicons name="cloud-offline-outline" size={36} color={t.muted} />
            <AppText variant="heading">Impossible de charger</AppText>
            <AppText muted>{error instanceof ApiError ? error.title : 'Vérifiez votre connexion.'}</AppText>
            <Button label="Réessayer" icon="refresh" onPress={() => { ref.refetch(); q.refetch(); }} />
          </Card>
        </View>
      )}

      {q.isSuccess && list.length > 0 && !metier && !f && (
        <View style={{ gap: 12 }}>
          <AppText variant="heading" style={s.pad}>À la une</AppText>
          <FlatList horizontal data={list.slice(0, 5)} keyExtractor={(m) => m.id} showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + 12} decelerationRate="fast" contentContainerStyle={[s.pad, { gap: 12 }]}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)))}
            renderItem={({ item }) => <HeroCard mission={item} width={cardW} onPress={() => open(router, item.id)} />} />
          <View style={s.dots}>{list.slice(0, 5).map((m, k) => <View key={m.id} style={[s.dot, { backgroundColor: k === page ? t.brand : t.line, width: k === page ? 22 : 8 }]} />)}</View>
        </View>
      )}

      {q.isSuccess && (
        <View style={[s.pad, { gap: 12 }]}>
          <View style={s.titleRow}>
            <AppText variant="heading">Annonces près de chez vous</AppText>
            <AppText variant="caption" muted>{list.length} annonce{list.length > 1 ? 's' : ''}</AppText>
          </View>
          {list.length === 0
            ? <Card><AppText variant="heading">{f || metier ? 'Aucun résultat' : 'Aucune annonce pour le moment'}</AppText><AppText muted>{f || metier ? 'Essayez un autre métier ou un autre mot.' : 'Revenez bientôt, de nouvelles missions arrivent.'}</AppText></Card>
            : list.map((m) => <MissionCard key={m.id} mission={m} onPress={() => open(router, m.id)} />)}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { paddingBottom: 130, gap: 20 },
  pad: { paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.xl, borderWidth: 1.5 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: 12, alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.pill, marginHorizontal: 20, paddingHorizontal: 18, minHeight: 56 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
