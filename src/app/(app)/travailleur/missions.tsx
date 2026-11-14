import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useWorkerApplications, useWorkerMissions } from '../../../api/hooks';
import { fcfa, fdate, HORAIRE, STATUT_CANDIDATURE } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { MetierThumb } from '../../../ui/MetierThumb';
import { Segmented } from '../../../ui/Segmented';

type Ligne = {
  id: string; statut?: string;
  mission?: {
    id: string; lieu?: string | null; dateMission?: string; remunerationFcfa?: number; typeHoraire?: string;
    statut?: string; metier?: { libelle?: string }; zone?: { nom?: string };
  } | null;
};

function LigneCandidature({ c }: { c: Ligne }) {
  const t = useTheme();
  const router = useRouter();
  const m = c.mission;
  return (
    <Card>
      <View style={s.row}>
        <MetierThumb metier={m?.metier?.libelle ?? ''} size={56} radius={16} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading" numberOfLines={1}>{m ? `${m.metier?.libelle ?? 'Mission'} à ${m.zone?.nom ?? ''}` : 'Mission'}</AppText>
          {m ? <AppText variant="caption" muted>{fdate(m.dateMission ?? '')}{m.typeHoraire ? ` · ${HORAIRE[m.typeHoraire] ?? m.typeHoraire}` : ''}{typeof m.remunerationFcfa === 'number' ? ` · ${fcfa(m.remunerationFcfa)}` : ''}</AppText> : null}
          <AppText variant="caption" color={c.statut === 'CONFIRMEE' ? t.green : t.muted} style={{ fontWeight: '700' }}>{STATUT_CANDIDATURE[c.statut ?? ''] ?? c.statut}</AppText>
        </View>
      </View>
      {m?.lieu ? <View style={s.row}><Ionicons name="pin-outline" size={16} color={t.muted} /><AppText variant="caption" muted>{m.lieu}</AppText></View> : null}
      {m ? <Button label="Voir la mission" variant="ghost" icon="chevron-forward" onPress={() => router.push({ pathname: '/mission/[id]', params: { id: m.id } })} /> : null}
    </Card>
  );
}

// Historique complet : missions confirmées et toutes les candidatures du travailleur.
export default function HistoriqueTravailleur() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [vue, setVue] = useState<'missions' | 'candidatures'>('missions');
  const missions = useWorkerMissions();
  const applications = useWorkerApplications();
  const q = vue === 'missions' ? missions : applications;
  const list = (q.data ?? []) as Ligne[];

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { missions.refetch(); applications.refetch(); }} tintColor={t.brand} />}>
      <AppText variant="display">Mon historique</AppText>
      <Segmented value={vue} onChange={setVue} options={[{ value: 'missions', label: 'Missions confirmées' }, { value: 'candidatures', label: 'Candidatures' }]} />
      {q.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 30 }} />}
      {q.isError && <><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger votre historique.'} /><Button label="Réessayer" icon="refresh" onPress={() => q.refetch()} /></>}
      {q.isSuccess && list.length === 0 && (
        <Card>
          <View style={[s.bigIcon, { backgroundColor: t.soft }]}><Ionicons name="time-outline" size={36} color={t.brand} /></View>
          <AppText variant="heading">{vue === 'missions' ? 'Aucune mission confirmée' : 'Aucune candidature'}</AppText>
          <AppText muted>{vue === 'missions' ? 'Vos missions confirmées apparaîtront ici.' : 'Postulez à une annonce pour commencer votre historique.'}</AppText>
        </Card>
      )}
      {list.map((c) => <LigneCandidature key={c.id} c={c} />)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
});
