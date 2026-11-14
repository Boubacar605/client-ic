import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAdminMission, updateAdminMissionStatus } from '../../../../api/admin';
import { ApiError } from '../../../../api/client';
import { fcfa, fdate, STATUT_MISSION } from '../../../../lib/format';
import { useTheme } from '../../../../theme/useTheme';
import { AppText } from '../../../../ui/AppText';
import { Button } from '../../../../ui/Button';
import { Card } from '../../../../ui/Card';
import { ErrorBox } from '../../../../ui/ErrorBox';

const ACTIONS = ['PUBLIEE', 'SUSPENDUE', 'CLOTUREE', 'ANNULEE', 'TERMINEE'];

export default function AdminMissionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-mission', id], enabled: !!id, queryFn: () => getAdminMission(id!) });
  const change = useMutation({
    mutationFn: (value: string) => updateAdminMissionStatus(id!, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-mission', id] }); qc.invalidateQueries({ queryKey: ['admin-missions'] }); },
  });
  const m = q.data;
  const error = q.error ?? change.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/admin/missions'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={22} color={t.text} /></Pressable>
        <View style={{ flex: 1 }}><AppText variant="heading">Mission</AppText><AppText muted numberOfLines={1}>{id}</AppText></View>
      </View>

      {q.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger la mission.'} />}

      {m && (
        <Card>
          <View style={s.rowBetween}>
            <AppText variant="title" numberOfLines={2}>{m.metier} · {m.zone}</AppText>
            <View style={[s.status, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand}>{STATUT_MISSION[m.statut] ?? m.statut}</AppText></View>
          </View>
          <AppText muted>{m.recruteur}</AppText>
          <View style={s.row}><Ionicons name="calendar-outline" size={18} color={t.muted} /><AppText>{fdate(m.dateMission)}</AppText></View>
          <View style={s.row}><Ionicons name="cash-outline" size={18} color={t.muted} /><AppText>{fcfa(m.remunerationFcfa)} par personne</AppText></View>
          <View style={s.row}><Ionicons name="people-outline" size={18} color={t.muted} /><AppText>{m.nombrePostes} poste(s) · {m.candidaturesCount} candidature(s)</AppText></View>
          {m.description ? <AppText muted>{m.description}</AppText> : null}
          <Button label="Ouvrir la fiche complète" variant="secondary" icon="open-outline" onPress={() => router.push({ pathname: '/mission/[id]', params: { id: m.id } })} />
        </Card>
      )}

      {m && (
        <Card>
          <AppText variant="heading">Changer le statut</AppText>
          <View style={s.filters}>
            {ACTIONS.filter((a) => a !== m.statut).map((a) => (
              <Pressable key={a} accessibilityRole="button" disabled={change.isPending} onPress={() => change.mutate(a)}
                style={[s.chip, { borderColor: t.brand, backgroundColor: t.card }]}>
                <AppText variant="caption" color={t.brand}>{STATUT_MISSION[a] ?? a}</AppText>
              </Pressable>
            ))}
          </View>
          {change.isSuccess ? <AppText color={t.brand} style={{ fontWeight: '700' }}>Statut mis à jour.</AppText> : null}
        </Card>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  status: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
});
