import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useCandidatures, useDashboard, useMission, useMissions } from '../../../api/hooks';
import { useReference } from '../../../api/reference';
import type { Candidature } from '../../../api/types';
import { useSession } from '../../../auth/session';
import { fcfa, fdate, STATUT_CANDIDATURE } from '../../../lib/format';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { HeroCard } from '../../../ui/HeroCard';
import { ListRow } from '../../../ui/ListRow';
import { MetierPicker } from '../../../ui/MetierPicker';
import { MetierThumb } from '../../../ui/MetierThumb';
import { MissionCard } from '../../../ui/MissionCard';
import { SectionHeader } from '../../../ui/SectionHeader';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

const open = (router: ReturnType<typeof useRouter>, id: string) => router.push({ pathname: '/mission/[id]', params: { id } });

const CANDIDATURE_COLORS: Record<string, 'brand' | 'amber' | 'green' | 'error'> = {
  PROPOSEE: 'brand', INTERESSE: 'brand', SELECTIONNEE: 'amber', CONFIRMEE: 'green', REFUSEE: 'error', RETIREE: 'error', ANNULEE: 'error',
};

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

function CandidatureRow({ c }: { c: Candidature }) {
  const t = useTheme();
  const router = useRouter();
  const m = useMission(c.missionId).data;
  const tone = CANDIDATURE_COLORS[c.statut] ?? 'brand';
  const color = tone === 'error' ? t.error : tone === 'amber' ? t.amber : tone === 'green' ? t.green : t.brand;
  return (
    <ListRow title={m ? `${m.metier} · ${m.zone}` : 'Mission'} icon="paper-plane-outline"
      subtitle={m ? `${fdate(m.date)} · ${fcfa(m.remunerationFcfa)}` : undefined}
      trailing={STATUT_CANDIDATURE[c.statut] ?? c.statut} trailingColor={color}
      onPress={() => open(router, c.missionId)} />
  );
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

  const prenom = (profil?.nom ?? '').split(' ')[0];
  const initiales = (profil?.nom ?? profil?.email ?? '?').split(/[ @]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const missions = q.data ?? [];
  const metiers = Array.from(new Set<string>(missions.map((m) => m.metier)));
  const f = recherche.trim().toLowerCase();
  const list = missions.filter((m) => (!metier || m.metier === metier) && `${m.metier} ${m.zone}`.toLowerCase().includes(f));
  const cands = cq.data ?? [];
  const retenus = cands.filter((c) => c.statut === 'SELECTIONNEE');
  const prochaine = cands.find((c) => c.statut === 'CONFIRMEE');
  const demandes = cands.filter((c) => ['PROPOSEE', 'INTERESSE', 'LISTE_ATTENTE'].includes(c.statut));
  const d = dash.data ?? {};
  const ds = d.stats ?? {};
  const stats: StatItem[] = [
    { key: 'confirmed', label: 'Missions confirmées', value: ds.applicationsConfirmed, icon: 'checkmark-done-outline' },
    { key: 'pending', label: 'Candidatures en attente', value: ds.applicationsPending, icon: 'hourglass-outline' },
    { key: 'completed', label: 'Missions terminées', value: ds.missionsCompleted, icon: 'flag-outline' },
    { key: 'reliability', label: 'Fiabilité', value: typeof ds.scoreFiabilite === 'number' ? `${Math.round(ds.scoreFiabilite)} %` : null, icon: 'shield-checkmark-outline' },
    { key: 'net', label: 'Revenus nets', value: typeof ds.netRevenue === 'number' ? fcfa(ds.netRevenue) : null, icon: 'cash-outline' },
    { key: 'debt', label: 'Commission restante', value: typeof ds.remainingCommission === 'number' && ds.remainingCommission > 0 ? fcfa(ds.remainingCommission) : null, icon: 'wallet-outline', accent: 'amber' },
  ];
  const upcoming = Array.isArray(d.upcomingMissions) ? (d.upcomingMissions as { id: string; description: string; dateMission: string; metier: string; zone: string }[]) : [];
  const upcomingAutres = upcoming.filter((m) => m.id !== prochaine?.missionId);
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

      {retenus.length > 0 && (
        <View style={[s.pad, s.section]}>
          <SectionHeader title="À faire" count={retenus.length} caption="Confirmez votre place avant qu’elle ne soit proposée à quelqu’un d’autre." />
          {retenus.map((c) => <Retenu key={c.id} c={c} />)}
        </View>
      )}

      {(prochaine || upcomingAutres.length > 0) && (
        <View style={[s.pad, s.section]}>
          <SectionHeader title="Mes missions" count={(prochaine ? 1 : 0) + upcomingAutres.length} caption="Votre planning confirmé." />
          {prochaine && <Prochaine c={prochaine} width={Math.min(width - 40, 440)} />}
          {upcomingAutres.length > 0 && (
            <View style={s.group}>
              <AppText variant="caption" muted style={s.groupLabel}>À venir</AppText>
              {upcomingAutres.map((m) => (
                <ListRow key={m.id} title={`${m.metier} · ${m.zone}`} icon="calendar-outline"
                  subtitle={`${fdate(m.dateMission)} · ${m.description}`} onPress={() => open(router, m.id)} />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={[s.pad, s.section]}>
        <SectionHeader title="Mes indicateurs" caption="Votre fiabilité et vos revenus."
          actionLabel="Historique" onAction={() => router.push('/travailleur/missions' as never)} />
        <StatGrid items={stats} />
      </View>

      <View style={[s.pad, s.section]}>
        <SectionHeader title="Mes candidatures" count={demandes.length} caption="Les réponses en attente de votre recruteur."
          actionLabel="Tout voir" onAction={() => router.push('/travailleur/demandes' as never)} />
        {demandes.length === 0 ? (
          <Card><AppText muted>Aucune candidature en attente. Parcourez les annonces ci-dessous pour trouver votre prochaine mission.</AppText></Card>
        ) : demandes.slice(0, 4).map((c) => <CandidatureRow key={c.id} c={c} />)}
      </View>

      <View style={[s.pad, s.section]}>
        <SectionHeader title="Découvrir des missions" count={list.length} caption="Les annonces ouvertes près de chez vous." />
        <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
          <Ionicons name="search" size={22} color={t.muted} />
          <TextInput accessibilityLabel="Rechercher un métier ou un quartier" placeholder="Rechercher un métier, un quartier…"
            placeholderTextColor={t.muted} value={recherche} onChangeText={setRecherche} style={[s.input, { color: t.text }]} />
        </View>

        {metiers.length > 1 && (
          <MetierPicker options={metiers.map((m) => ({ key: m, label: m }))} value={metier} onChange={setMetier}
            label="Filtrer par métier" placeholder="Tous les métiers" allowAll allLabel="Tous les métiers" />
        )}

        {(q.isLoading || ref.isLoading) && <View style={{ padding: 30 }}><ActivityIndicator color={t.brand} /></View>}

        {error && (
          <Card>
            <Ionicons name="cloud-offline-outline" size={36} color={t.muted} />
            <AppText variant="heading">Impossible de charger</AppText>
            <AppText muted>{error instanceof ApiError ? error.title : 'Vérifiez votre connexion.'}</AppText>
            <Button label="Réessayer" icon="refresh" onPress={() => { ref.refetch(); q.refetch(); }} />
          </Card>
        )}

        {q.isSuccess && (list.length === 0
          ? <Card><AppText variant="heading">{f || metier ? 'Aucun résultat' : 'Aucune annonce pour le moment'}</AppText><AppText muted>{f || metier ? 'Essayez un autre métier ou un autre mot.' : 'Revenez bientôt, de nouvelles missions arrivent.'}</AppText></Card>
          : <View style={s.group}>{list.map((m) => <MissionCard key={m.id} mission={m} onPress={() => open(router, m.id)} />)}</View>)}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { paddingBottom: 130, gap: 22, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  pad: { paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.xl, borderWidth: 1.5 },
  section: { gap: 12 },
  group: { gap: 10 },
  groupLabel: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 18, minHeight: 56 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
});
