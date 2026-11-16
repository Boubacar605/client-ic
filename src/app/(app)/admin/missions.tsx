import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listAdminMissions, updateAdminMissionStatus } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { fcfa, fdate, STATUT_MISSION } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';

const STATUTS = ['', 'BROUILLON', 'PUBLIEE', 'PARTIELLEMENT_POURVUE', 'POURVUE', 'EN_COURS', 'TERMINEE', 'CLOTUREE', 'ANNULEE', 'SUSPENDUE'];
const ACTIONS = ['PUBLIEE', 'SUSPENDUE', 'CLOTUREE', 'ANNULEE', 'TERMINEE'];
// Transitions autorisées côté back-office (statut cible -> statuts de départ acceptés).
const ALLOWED_FROM: Record<string, string[]> = {
  PUBLIEE: ['BROUILLON'],
  SUSPENDUE: ['PUBLIEE', 'PARTIELLEMENT_POURVUE', 'POURVUE'],
  CLOTUREE: ['PUBLIEE', 'PARTIELLEMENT_POURVUE', 'POURVUE', 'EN_COURS'],
  ANNULEE: ['BROUILLON', 'PUBLIEE', 'PARTIELLEMENT_POURVUE', 'POURVUE', 'EN_COURS'],
  TERMINEE: ['EN_COURS'],
};
const actionsFor = (statut: string) => ACTIONS.filter((a) => ALLOWED_FROM[a]?.includes(statut));

export default function AdminMissions() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['admin-missions', statut, page],
    queryFn: () => listAdminMissions({ statut: statut || undefined, page, limit: 20 }),
  });
  const change = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => updateAdminMissionStatus(id, value),
    onSuccess: () => { setOpenId(null); qc.invalidateQueries({ queryKey: ['admin-missions'] }); qc.invalidateQueries({ queryKey: ['admin-mission-stats'] }); },
  });
  const rows = query.data?.data ?? [];
  const error = query.error ?? change.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={t.brand} />}>
      <View style={s.head}><View style={{ flex: 1 }}><AppText variant="display">Missions</AppText><AppText muted>{query.data?.total ?? 0} mission(s)</AppText></View></View>

      <View style={s.filters}>
        {STATUTS.map((st) => (
          <Pressable key={st || 'tous'} accessibilityRole="button" onPress={() => { setStatut(st); setPage(1); }}
            style={[s.chip, { borderColor: statut === st ? t.brand : t.line, backgroundColor: statut === st ? t.soft : t.card }]}>
            <AppText variant="caption" color={statut === st ? t.brand : t.muted}>{st ? STATUT_MISSION[st] ?? st : 'Tous'}</AppText>
          </Pressable>
        ))}
      </View>

      {query.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les missions.'} />}
      {query.isSuccess && !rows.length && <Card><AppText muted>Aucune mission pour ce filtre.</AppText></Card>}

      {rows.map((m: any) => (
        <Card key={m.id} style={{ gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/admin/mission/[id]', params: { id: m.id } })} style={s.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" numberOfLines={1}>{m.metier} · {m.zone}</AppText>
              <AppText variant="caption" muted numberOfLines={1}>{m.recruteur} · {fdate(m.dateMission)} · {m.nombrePostes} poste(s)</AppText>
              <AppText variant="caption" muted numberOfLines={1}>{fcfa(m.remunerationFcfa)} · {m.candidaturesCount} candidature(s)</AppText>
            </View>
            <View style={[s.status, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand}>{STATUT_MISSION[m.statut] ?? m.statut}</AppText></View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Pressable>
          <Button label={openId === m.id ? 'Fermer' : 'Changer le statut'} variant="secondary" icon="swap-horizontal" onPress={() => setOpenId(openId === m.id ? null : m.id)} />
          {openId === m.id && (
            actionsFor(m.statut).length
              ? <View style={s.filters}>
                {actionsFor(m.statut).map((a) => (
                  <Pressable key={a} accessibilityRole="button" disabled={change.isPending} onPress={() => change.mutate({ id: m.id, value: a })}
                    style={[s.chip, { borderColor: t.brand, backgroundColor: t.card }]}>
                    <AppText variant="caption" color={t.brand}>{STATUT_MISSION[a] ?? a}</AppText>
                  </Pressable>
                ))}
              </View>
              : <AppText variant="caption" muted>Aucune transition disponible pour ce statut.</AppText>
          )}
        </Card>
      ))}

      {(query.data?.totalPages ?? 0) > 1 && (
        <View style={s.pager}>
          <View style={{ flex: 1 }}><Button label="Précédent" variant="secondary" disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} /></View>
          <AppText variant="caption" muted>Page {page} / {query.data?.totalPages}</AppText>
          <View style={{ flex: 1 }}><Button label="Suivant" variant="secondary" disabled={page >= (query.data?.totalPages ?? 1)} onPress={() => setPage((p) => p + 1)} /></View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 12, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  status: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
