import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useMissions, useRecruiterDashboard } from '../../../api/hooks';
import { useReference } from '../../../api/reference';
import { useSession } from '../../../auth/session';
import { fdate, STATUT_CANDIDATURE, STATUT_MISSION } from '../../../lib/format';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { HeroCard } from '../../../ui/HeroCard';
import { MissionCard } from '../../../ui/MissionCard';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

type RecentMission = { id: string; description: string; dateMission: string; statut: string; metier: string; zone: string; candidatesCount: number };
type RecentApplication = { id: string; statut: string; createdAt: string; missionId: string; workerName: string; mission: string };

// Tableau de bord recruteur : ses missions, ses candidats, ses urgences.
export default function RecruteurAccueil() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profil } = useSession();
  const ref = useReference();
  const q = useMissions();
  const dash = useRecruiterDashboard();
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(0);

  const prenom = (profil?.nom ?? '').split(' ')[0];
  const initiales = (profil?.nom ?? profil?.email ?? '?').split(/[ @]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const f = recherche.trim().toLowerCase();
  const missions = (q.data ?? []).filter((m) => `${m.metier} ${m.zone} ${m.lieu ?? ''}`.toLowerCase().includes(f));
  const vedettes = missions.filter((m) => ['PUBLIEE', 'PARTIELLEMENT_POURVUE', 'POURVUE'].includes(m.statut)).slice(0, 5);
  const cardW = Math.min(width - 56, 420);
  const open = (id: string) => router.push({ pathname: '/mission/[id]', params: { id } });
  const d = dash.data ?? {};
  const ds = d.stats ?? {};
  const recentMissions: RecentMission[] = Array.isArray(d.recentMissions) ? d.recentMissions : [];
  const recentApplications: RecentApplication[] = Array.isArray(d.recentApplications) ? d.recentApplications : [];
  const stats: StatItem[] = [
    { key: 'active', label: 'Missions actives', value: ds.activeMissions, icon: 'briefcase-outline' },
    { key: 'completed', label: 'Missions terminées', value: ds.completedMissions, icon: 'checkmark-done-outline' },
    { key: 'candidates', label: 'Candidatures reçues', value: ds.candidatesTotal, icon: 'people-outline' },
    { key: 'confirmed', label: 'Travailleurs confirmés', value: ds.confirmedWorkers, icon: 'shield-checkmark-outline' },
    { key: 'urgent', label: 'Missions urgentes', value: ds.missionsUrgentes, icon: 'flash-outline', accent: 'amber' },
  ];
  const error = q.error ?? ref.error ?? dash.error;
  const refresh = () => { q.refetch(); dash.refetch(); };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={[s.head, s.pad]}>
        <View style={{ flex: 1 }}>
          <AppText variant="display" numberOfLines={2}>Bonjour{prenom ? `, ${prenom}` : ''} !</AppText>
          <AppText muted>Vos annonces et vos candidats.</AppText>
        </View>
        <View style={[s.avatar, { backgroundColor: t.sun }]}><AppText variant="heading" color="#14201c">{initiales}</AppText></View>
      </View>

      <View style={s.pad}><StatGrid items={stats} /></View>

      <View style={[s.pad, s.actions]}>
        <View style={{ flex: 1 }}><Button label="Publier une mission" icon="add" onPress={() => router.navigate('/recruteur/publier')} /></View>
        <View style={{ flex: 1 }}><Button label="Actualiser" icon="refresh" variant="secondary" onPress={refresh} /></View>
      </View>

      {recentApplications.length > 0 && (
        <View style={[s.pad, { gap: 10 }]}>
          <AppText variant="heading">Dernières candidatures</AppText>
          {recentApplications.slice(0, 5).map((a) => (
            <Card key={a.id} style={{ padding: 14, gap: 4 }}>
              <View style={s.titleRow}>
                <AppText variant="label" numberOfLines={1}>{a.workerName}</AppText>
                <AppText variant="caption" color={t.brand}>{STATUT_CANDIDATURE[a.statut] ?? a.statut}</AppText>
              </View>
              <AppText variant="caption" muted numberOfLines={1}>{a.mission}</AppText>
              <Button label="Voir la mission" variant="ghost" icon="chevron-forward" onPress={() => open(a.missionId)} />
            </Card>
          ))}
        </View>
      )}

      {recentMissions.length > 0 && (
        <View style={[s.pad, { gap: 10 }]}>
          <AppText variant="heading">Vos dernières missions</AppText>
          {recentMissions.map((m) => (
            <Card key={m.id} style={{ padding: 14, gap: 4 }}>
              <View style={s.titleRow}>
                <AppText variant="label" numberOfLines={1}>{m.metier} · {m.zone}</AppText>
                <AppText variant="caption" color={t.brand}>{STATUT_MISSION[m.statut] ?? m.statut}</AppText>
              </View>
              <AppText variant="caption" muted numberOfLines={1}>{fdate(m.dateMission)} · {m.candidatesCount} candidat{m.candidatesCount > 1 ? 's' : ''}</AppText>
              <Button label="Ouvrir" variant="ghost" icon="chevron-forward" onPress={() => open(m.id)} />
            </Card>
          ))}
        </View>
      )}

      <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
        <Ionicons name="search" size={22} color={t.muted} />
        <TextInput accessibilityLabel="Rechercher un métier ou un quartier" placeholder="Rechercher un métier, un quartier…"
          placeholderTextColor={t.muted} value={recherche} onChangeText={setRecherche} style={[s.input, { color: t.text }]} />
      </View>

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

      {q.isSuccess && vedettes.length > 0 && (
        <View style={{ gap: 12 }}>
          <AppText variant="heading" style={s.pad}>À la une</AppText>
          <FlatList horizontal data={vedettes} keyExtractor={(m) => m.id} showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + 12} decelerationRate="fast" contentContainerStyle={[s.pad, { gap: 12 }]}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)))}
            renderItem={({ item }) => <HeroCard mission={item} width={cardW} onPress={() => open(item.id)} />} />
          <View style={s.dots}>{vedettes.map((m, k) => <View key={m.id} style={[s.dot, { backgroundColor: k === page ? t.brand : t.line, width: k === page ? 22 : 8 }]} />)}</View>
        </View>
      )}

      {q.isSuccess && (
        <View style={[s.pad, { gap: 12 }]}>
          <View style={s.titleRow}>
            <AppText variant="heading">Toutes vos annonces</AppText>
            <AppText variant="caption" muted>{missions.length} annonce{missions.length > 1 ? 's' : ''}</AppText>
          </View>
          {missions.length === 0 ? (
            <Card>
              <AppText variant="heading">{f ? 'Aucun résultat' : 'Pas encore de mission'}</AppText>
              <AppText muted>{f ? 'Essayez un autre mot.' : 'Publiez votre premier besoin en deux minutes.'}</AppText>
              {!f && <Button label="Publier une mission" icon="add" large onPress={() => router.navigate('/recruteur/publier')} />}
            </Card>
          ) : missions.map((m) => <MissionCard key={m.id} mission={m} onPress={() => open(m.id)} />)}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { paddingBottom: 130, gap: 20, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  pad: { paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.pill, marginHorizontal: 20, paddingHorizontal: 18, minHeight: 56 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
});
