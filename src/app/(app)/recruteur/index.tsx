import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useMissions, useRecruiterDashboard } from '../../../api/hooks';
import { useReference } from '../../../api/reference';
import { useSession } from '../../../auth/session';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ListRow } from '../../../ui/ListRow';
import { SectionHeader } from '../../../ui/SectionHeader';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

const OUVERTES = ['PUBLIEE', 'PARTIELLEMENT_POURVUE'];

// Tableau de bord recruteur : chiffres clés, actions et accès aux listes détaillées.
export default function RecruteurAccueil() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profil } = useSession();
  const ref = useReference();
  const q = useMissions();
  const dash = useRecruiterDashboard();

  const prenom = (profil?.nom ?? '').split(' ')[0];
  const initiales = (profil?.nom ?? profil?.email ?? '?').split(/[ @]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const d = dash.data ?? {};
  const ds = d.stats ?? {};
  const missions = q.data ?? [];
  const aPourvoir = missions.filter((m) => OUVERTES.includes(m.statut)).length;
  const urgences = missions.filter((m) => OUVERTES.includes(m.statut) && m.urgente).length;
  const totalCandidatures = typeof ds.candidatesTotal === 'number' ? ds.candidatesTotal : 0;
  const resumeMissions = missions.length === 0
    ? 'Aucune annonce pour le moment.'
    : aPourvoir > 0
      ? `${aPourvoir} à pourvoir${urgences > 0 ? `, ${urgences} urgente${urgences > 1 ? 's' : ''}` : ''} · filtrer par statut.`
      : 'Aucune mission à pourvoir · filtrer par statut.';
  const resumeCandidatures = totalCandidatures > 0
    ? `${totalCandidatures} profil${totalCandidatures > 1 ? 's' : ''} reçu${totalCandidatures > 1 ? 's' : ''} · filtrer par étape.`
    : 'Aucun profil reçu pour le moment.';
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

      <View style={[s.pad, s.section]}>
        <SectionHeader title="Vue d’ensemble" caption="Vos chiffres clés en temps réel." />
        <StatGrid items={stats} />
      </View>

      <View style={[s.pad, s.actions]}>
        <View style={{ flex: 1 }}><Button label="Publier une mission" icon="add" onPress={() => router.navigate('/recruteur/publier')} /></View>
        <View style={{ flex: 1 }}><Button label="Actualiser" icon="refresh" variant="secondary" onPress={refresh} /></View>
      </View>

      {error && (
        <View style={s.pad}>
          <Card>
            <Ionicons name="cloud-offline-outline" size={36} color={t.muted} />
            <AppText variant="heading">Impossible de charger</AppText>
            <AppText muted>{error instanceof ApiError ? error.title : 'Vérifiez votre connexion.'}</AppText>
            <Button label="Réessayer" icon="refresh" onPress={() => { ref.refetch(); q.refetch(); dash.refetch(); }} />
          </Card>
        </View>
      )}

      <View style={[s.pad, s.section]}>
        <SectionHeader title="Vos listes" caption="Chaque liste s’ouvre avec ses filtres par statut." />
        <ListRow title="Mes missions" icon="briefcase-outline" subtitle={resumeMissions}
          trailing={`${missions.length}`} onPress={() => router.push('/recruteur-missions' as never)} />
        <ListRow title="Candidatures" icon="people-outline" subtitle={resumeCandidatures}
          trailing={`${totalCandidatures}`} onPress={() => router.push('/recruteur-candidatures' as never)} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { paddingBottom: 130, gap: 22, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  pad: { paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  section: { gap: 12 },
});
