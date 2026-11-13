import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apply, confirmCandidature, rejectCandidature, selectCandidature, withdrawCandidature } from '../../../api/candidatures';
import { ApiError } from '../../../api/client';
import { useCandidatures, useMission } from '../../../api/hooks';
import { cancelMission, closeMission, publishMission } from '../../../api/missions';
import { useSession } from '../../../auth/session';
import { fcfa, fdate, HORAIRE, STATUT_MISSION } from '../../../lib/format';
import { useAct } from '../../../lib/useAct';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { MetierThumb } from '../../../ui/MetierThumb';
import { StatusChip } from '../../../ui/StatusChip';

const OUVERTE = ['PUBLIEE', 'PARTIELLEMENT_POURVUE'];
const CANAL: Record<string, string> = { APPLICATION: 'Application', WHATSAPP: 'WhatsApp', APPEL: 'Appel', SMS: 'SMS' };

// Détail d'une mission. Recruteur : candidats à retenir. Travailleur : postuler et suivre sa demande.
export default function MissionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profil } = useSession();
  const worker = profil?.role === 'TRAVAILLEUR';
  const mq = useMission(id);
  const cq = useCandidatures(id);
  const act = useAct();
  const [askCancel, setAskCancel] = useState(false);
  const [askDes, setAskDes] = useState(false);

  const m = mq.data;
  const cands = cq.data ?? [];
  const mine = worker ? cands.find((c) => c.travailleurId === profil?.id) ?? cands[0] : undefined;
  const confirmed = cands.filter((c) => c.statut === 'CONFIRMEE').length;
  const retained = cands.filter((c) => c.statut === 'SELECTIONNEE').length;
  const refetch = () => { mq.refetch(); cq.refetch(); };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[s.top, { paddingTop: insets.top + 8, backgroundColor: t.bg }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={24} color={t.text} /></Pressable>
        <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>{m ? `${m.metier} à ${m.zone}` : 'Mission'}</AppText>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={mq.isRefetching} onRefresh={refetch} tintColor={t.brand} />}>
        {mq.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 40 }} />}
        {mq.isError && <><ErrorBox message={mq.error instanceof ApiError ? mq.error.title : 'Impossible de charger la mission.'} /><Button label="Réessayer" icon="refresh" onPress={refetch} /></>}

        {m && (
          <Card>
            <View style={s.row}>
              <MetierThumb metier={m.metier} size={84} radius={22} />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="title" numberOfLines={1}>{m.metier}</AppText>
                <View style={s.row}><Ionicons name="location-outline" size={16} color={t.muted} /><AppText muted>{m.zone}</AppText></View>
                <View style={s.chips}>
                  <View style={[s.tag, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand} style={{ fontWeight: '800' }}>{STATUT_MISSION[m.statut] ?? m.statut}</AppText></View>
                  {m.urgente && <View style={[s.tag, { backgroundColor: t.sunSoft }]}><AppText variant="caption" color={t.amber} style={{ fontWeight: '800' }}>Urgent</AppText></View>}
                </View>
              </View>
            </View>
            <View style={s.row}><Ionicons name="calendar-outline" size={20} color={t.muted} /><AppText>{fdate(m.date)}, {HORAIRE[m.typeHoraire]}{m.typeHoraire === 'CRENEAU_PRECIS' && m.heureDebut ? ` (${m.heureDebut} à ${m.heureFin})` : ''}</AppText></View>
            <View style={s.row}><Ionicons name="cash-outline" size={20} color={t.muted} /><AppText variant="label" color={t.brand}>{fcfa(m.remunerationFcfa)} par personne</AppText></View>
            <View style={s.row}><Ionicons name="people-outline" size={20} color={t.muted} /><AppText>{worker ? `${m.nombrePostes} poste${m.nombrePostes > 1 ? 's' : ''}` : `${confirmed} confirmé${confirmed > 1 ? 's' : ''} sur ${m.nombrePostes}`}</AppText></View>
            {m.description ? <AppText muted>{m.description}</AppText> : null}
          </Card>
        )}

        {act.error && <ErrorBox message={act.error.title} code={act.error.code} />}

        {m && worker && (
          mine ? (
            <Card>
              <AppText variant="heading">Votre demande</AppText>
              <StatusChip statut={mine.statut} />
              {mine.statut === 'INTERESSE' && <AppText muted>Le recruteur choisit parmi les candidats. Vous serez prévenu s’il vous retient.</AppText>}
              {mine.statut === 'SELECTIONNEE' && (
                <>
                  <AppText color={t.amber} style={{ fontWeight: '700' }}>Vous êtes retenu ! Confirmez pour réserver votre place.</AppText>
                  <Button label="Je confirme" icon="checkmark" large loading={act.busy === 'conf'} onPress={() => act.run('conf', () => confirmCandidature(mine.id))} />
                </>
              )}
              {mine.statut === 'CONFIRMEE' && <AppText muted>C’est confirmé. Présentez-vous le jour prévu.</AppText>}
              {['INTERESSE', 'SELECTIONNEE', 'CONFIRMEE'].includes(mine.statut) && (askDes
                ? <Button label="Oui, je me retire" variant="secondary" loading={act.busy === 'des'} onPress={() => act.run('des', () => withdrawCandidature(mine.id))} />
                : <Button label={mine.statut === 'CONFIRMEE' ? 'Je ne peux plus venir' : 'Retirer ma candidature'} variant="ghost" onPress={() => setAskDes(true)} />)}
            </Card>
          ) : (
            <Button label={OUVERTE.includes(m.statut) ? 'Je postule' : 'Mission fermée'} icon="paper-plane" large disabled={!OUVERTE.includes(m.statut)}
              loading={act.busy === 'apply'} onPress={() => act.run('apply', () => apply(m.id, profil!))} />
          )
        )}

        {m && !worker && (
          <>
            <View style={s.titleRow}>
              <AppText variant="heading">Candidats ({cands.length})</AppText>
              {retained > 0 && <AppText variant="caption" muted>{retained} retenu{retained > 1 ? 's' : ''}, en attente</AppText>}
            </View>
            {cq.isLoading && <ActivityIndicator color={t.brand} />}
            {cq.isError && <ErrorBox message={cq.error instanceof ApiError ? cq.error.title : 'Impossible de charger les candidats.'} />}
            {cq.isSuccess && cands.length === 0 && <Card><AppText muted>Pas encore de candidat. Les premières réponses arrivent en général en quelques minutes. Tirez l’écran vers le bas pour actualiser.</AppText></Card>}
            {cands.map((c) => {
              const nom = c.travailleurNom ?? `Candidat ${c.id.slice(0, 4)}`;
              return (
                <Card key={c.id}>
                  <View style={s.row}>
                    <View style={[s.avatar, { backgroundColor: t.soft }]}><AppText variant="label" color={t.brand}>{nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</AppText></View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <AppText variant="heading" numberOfLines={1}>{nom}</AppText>
                      <AppText variant="caption" muted>{c.canal ? `Réponse par ${CANAL[c.canal] ?? c.canal}` : ''}</AppText>
                      <StatusChip statut={c.statut} />
                    </View>
                  </View>
                  {c.statut === 'CONFIRMEE' && c.telephone ? <View style={s.row}><Ionicons name="call-outline" size={18} color={t.muted} /><AppText variant="label">{c.telephone}</AppText></View> : null}
                  {c.statut === 'INTERESSE' && (
                    <View style={s.row}>
                      <View style={{ flex: 1 }}><Button label="Retenir" icon="checkmark" loading={act.busy === `s${c.id}`} onPress={() => act.run(`s${c.id}`, () => selectCandidature(c.id))} /></View>
                      <View style={{ flex: 1 }}><Button label="Refuser" variant="secondary" loading={act.busy === `r${c.id}`} onPress={() => act.run(`r${c.id}`, () => rejectCandidature(c.id))} /></View>
                    </View>
                  )}
                  {c.statut === 'SELECTIONNEE' && <AppText variant="caption" color={t.amber} style={{ fontWeight: '700' }}>En attente de sa confirmation.</AppText>}
                </Card>
              );
            })}

            {m.statut === 'BROUILLON' && <Button label="Publier la mission" icon="paper-plane" large loading={act.busy === 'pub'} onPress={() => act.run('pub', () => publishMission(m.id))} />}
            {confirmed > 0 && !['TERMINEE', 'CLOTUREE', 'ANNULEE'].includes(m.statut) && <Button label="Clôturer la mission" icon="flag" variant="secondary" large loading={act.busy === 'close'} onPress={() => act.run('close', () => closeMission(m.id))} />}
            {!['TERMINEE', 'CLOTUREE', 'ANNULEE'].includes(m.statut) && (askCancel
              ? <Button label="Oui, annuler la mission" variant="secondary" loading={act.busy === 'cancel'} onPress={() => act.run('cancel', () => cancelMission(m.id))} />
              : <Button label="Annuler la mission" variant="ghost" onPress={() => setAskCancel(true)} />)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  back: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
