import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirmCandidature, withdrawCandidature } from '../../../api/candidatures';
import { ApiError } from '../../../api/client';
import { useCandidatures, useMission } from '../../../api/hooks';
import type { Candidature } from '../../../api/types';
import { fcfa, fdate, HORAIRE } from '../../../lib/format';
import { useAct } from '../../../lib/useAct';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { Segmented } from '../../../ui/Segmented';
import { MetierThumb } from '../../../ui/MetierThumb';
import { StatusChip } from '../../../ui/StatusChip';

type Act = ReturnType<typeof useAct>;

function Row({ c, act }: { c: Candidature; act: Act }) {
  const t = useTheme();
  const router = useRouter();
  const m = useMission(c.missionId).data;
  const [ask, setAsk] = useState(false);
  return (
    <Card>
      <View style={s.row}>
        <MetierThumb metier={m?.metier ?? ''} size={64} radius={18} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading" numberOfLines={1}>{m ? `${m.metier} à ${m.zone}` : 'Mission'}</AppText>
          {m && <AppText variant="caption" muted>{fdate(m.date)}, {HORAIRE[m.typeHoraire]}, {fcfa(m.remunerationFcfa)}</AppText>}
          <StatusChip statut={c.statut} />
        </View>
      </View>
      {c.statut === 'SELECTIONNEE' && (
        <>
          <AppText variant="caption" color={t.amber} style={{ fontWeight: '700' }}>Vous êtes retenu : confirmez vite, la place peut être donnée à quelqu’un d’autre.</AppText>
          <Button label="Je confirme" icon="checkmark" large loading={act.busy === `c${c.id}`} onPress={() => act.run(`c${c.id}`, () => confirmCandidature(c.id))} />
          <Button label="Je ne peux pas" variant="ghost" loading={act.busy === `w${c.id}`} onPress={() => act.run(`w${c.id}`, () => withdrawCandidature(c.id))} />
        </>
      )}
      {['INTERESSE', 'PROPOSEE'].includes(c.statut) && <Button label="Retirer ma candidature" variant="secondary" loading={act.busy === `w${c.id}`} onPress={() => act.run(`w${c.id}`, () => withdrawCandidature(c.id))} />}
      {c.statut === 'CONFIRMEE' && (ask
        ? <Button label="Oui, je me désiste" variant="secondary" loading={act.busy === `w${c.id}`} onPress={() => act.run(`w${c.id}`, () => withdrawCandidature(c.id))} />
        : <Button label="Je ne peux plus venir" variant="ghost" onPress={() => setAsk(true)} />)}
      <Button label="Voir la mission" variant="ghost" icon="chevron-forward" onPress={() => router.push({ pathname: '/mission/[id]', params: { id: c.missionId } })} />
    </Card>
  );
}

// Les demandes du travailleur : il suit où il en est et confirme quand un recruteur le retient.
const ACTIVES = ['PROPOSEE', 'INTERESSE', 'SELECTIONNEE', 'CONFIRMEE', 'LISTE_ATTENTE'];

export default function Demandes() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const q = useCandidatures();
  const act = useAct();
  const [vue, setVue] = useState<'actives' | 'passees'>('actives');
  const all = q.data ?? [];
  const list = all.filter((c) => (vue === 'actives') === ACTIVES.includes(c.statut));
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
      <AppText variant="display">Mes demandes</AppText>
      <Segmented value={vue} onChange={setVue} options={[{ value: 'actives', label: 'En cours' }, { value: 'passees', label: 'Passées' }]} />
      {act.error && <ErrorBox message={act.error.title} code={act.error.code} />}
      {q.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 40 }} />}
      {q.isError && <><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger vos demandes.'} /><Button label="Réessayer" icon="refresh" onPress={() => q.refetch()} /></>}
      {q.isSuccess && list.length === 0 && (
        <Card>
          <View style={[s.bigIcon, { backgroundColor: t.soft }]}><Ionicons name="paper-plane-outline" size={40} color={t.brand} /></View>
          <AppText variant="heading">{vue === 'actives' ? 'Aucune demande en cours' : 'Rien de passé'}</AppText>
          <AppText muted>Quand vous postulez à une annonce, elle apparaît ici avec son avancement.</AppText>
        </Card>
      )}
      {list.map((c) => <Row key={c.id} c={c} act={act} />)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
});
