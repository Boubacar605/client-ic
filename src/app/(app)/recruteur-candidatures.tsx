import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../api/client';
import { useCandidatures, useMissions } from '../../api/hooks';
import type { Candidature } from '../../api/types';
import { fdate } from '../../lib/format';
import { radius } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ErrorBox } from '../../ui/ErrorBox';
import { FilterChips } from '../../ui/FilterChips';
import { StatusChip } from '../../ui/StatusChip';

type Filtre = 'TOUTES' | 'A_TRAITER' | 'RETENUES' | 'CONFIRMEES' | 'REFUSEES' | 'RETIREES';

const MATCH: Record<Filtre, (statut: string) => boolean> = {
  TOUTES: () => true,
  A_TRAITER: (s) => ['PROPOSEE', 'INTERESSE', 'LISTE_ATTENTE'].includes(s),
  RETENUES: (s) => s === 'SELECTIONNEE',
  CONFIRMEES: (s) => s === 'CONFIRMEE',
  REFUSEES: (s) => ['REFUSEE', 'EXPIREE'].includes(s),
  RETIREES: (s) => ['RETIREE', 'ANNULEE'].includes(s),
};

const FILTRES: { value: Filtre; label: string }[] = [
  { value: 'TOUTES', label: 'Toutes' },
  { value: 'A_TRAITER', label: 'À traiter' },
  { value: 'RETENUES', label: 'Retenues' },
  { value: 'CONFIRMEES', label: 'Confirmées' },
  { value: 'REFUSEES', label: 'Refusées' },
  { value: 'RETIREES', label: 'Retirées' },
];

function CandidatureRow({ candidature, mission, onPress }: { candidature: Candidature; mission?: string; onPress: () => void }) {
  const t = useTheme();
  const recue = candidature.createdAt ? fdate(candidature.createdAt.slice(0, 10)) : null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={candidature.travailleurNom ?? 'Candidature'} onPress={onPress}
      style={({ pressed }) => [s.row, { backgroundColor: t.card, borderColor: t.line, opacity: pressed ? 0.92 : 1 }]}>
      <View style={[s.icon, { backgroundColor: t.soft }]}><Ionicons name="person-outline" size={20} color={t.brand} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" numberOfLines={1}>{candidature.travailleurNom ?? 'Travailleur'}</AppText>
        <AppText variant="caption" muted numberOfLines={1}>{mission ?? 'Mission'}</AppText>
        {recue ? <AppText variant="caption" muted numberOfLines={1}>Reçue le {recue}</AppText> : null}
      </View>
      <StatusChip statut={candidature.statut} />
      <Ionicons name="chevron-forward" size={18} color={t.muted} />
    </Pressable>
  );
}

// Tous les profils reçus sur les annonces du recruteur, classés par étape de traitement.
export default function MesCandidatures() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useCandidatures();
  const missionsQuery = useMissions();
  const [filtre, setFiltre] = useState<Filtre>('TOUTES');

  const candidatures = q.data ?? [];
  const missions = missionsQuery.data ?? [];
  const missionLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of missions) map.set(m.id, `${m.metier} · ${m.zone}`);
    return map;
  }, [missions]);
  const counts = useMemo(() => {
    const out = {} as Record<Filtre, number>;
    for (const { value } of FILTRES) out[value] = candidatures.filter((c) => MATCH[value](c.statut)).length;
    return out;
  }, [candidatures]);
  const visible = useMemo(
    () => candidatures
      .filter((c) => MATCH[filtre](c.statut))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    [candidatures, filtre],
  );

  const open = (missionId: string) => router.push({ pathname: '/mission/[id]', params: { id: missionId } });
  const refresh = () => { q.refetch(); missionsQuery.refetch(); };
  const retour = () => (router.canGoBack() ? router.back() : router.navigate('/recruteur'));

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10} onPress={retour}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="display">Candidatures</AppText>
          <AppText muted>{candidatures.length} candidature{candidatures.length > 1 ? 's' : ''} reçue{candidatures.length > 1 ? 's' : ''} sur vos annonces.</AppText>
        </View>
      </View>

      <FilterChips options={FILTRES.map((o) => ({ ...o, count: counts[o.value] }))} value={filtre} onChange={setFiltre} />

      {q.isLoading && <View style={{ padding: 30 }}><ActivityIndicator color={t.brand} /></View>}

      {q.error && <><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger les candidatures.'} />
        <Button label="Réessayer" icon="refresh" variant="secondary" onPress={refresh} /></>}

      {q.isSuccess && visible.length === 0 && (
        <Card>
          <View style={[s.bigIcon, { backgroundColor: t.soft }]}><Ionicons name="people-outline" size={34} color={t.brand} /></View>
          <AppText variant="heading">{filtre === 'TOUTES' ? 'Aucune candidature' : 'Aucune candidature pour ce filtre'}</AppText>
          <AppText muted>{filtre === 'TOUTES' ? 'Les profils reçus sur vos annonces apparaîtront ici.' : 'Choisissez une autre étape de traitement.'}</AppText>
        </Card>
      )}

      {visible.map((c) => (
        <CandidatureRow key={c.id} candidature={c} mission={missionLabels.get(c.missionId)}
          onPress={() => { if (c.missionId) open(c.missionId); }} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
});
