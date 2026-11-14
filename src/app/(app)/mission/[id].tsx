import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apply, confirmCandidature, rejectCandidature, selectCandidature, withdrawCandidature } from '../../../api/candidatures';
import { ApiError } from '../../../api/client';
import { useCandidatures, useCandidature, useMission } from '../../../api/hooks';
import { cancelMission, closeMission, completeMission, deleteMission, publishMission, startMission, updateMission } from '../../../api/missions';
import { broadcastMission } from '../../../api/notifications';
import { sendWhatsapp } from '../../../api/whatsapp';
import { useSession } from '../../../auth/session';
import { fcfa, fdate, HORAIRE, STATUT_CANDIDATURE, STATUT_MISSION } from '../../../lib/format';
import { useAct } from '../../../lib/useAct';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { MetierThumb } from '../../../ui/MetierThumb';
import { StatusChip } from '../../../ui/StatusChip';
import { TextField } from '../../../ui/TextField';

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
  const canManage = profil?.role === 'RECRUTEUR';
  const mq = useMission(id);
  const cq = useCandidatures(id, worker || canManage);
  const act = useAct();
  const [askCancel, setAskCancel] = useState(false);
  const [askDes, setAskDes] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lieu, setLieu] = useState('');
  const [description, setDescription] = useState('');
  const [remuneration, setRemuneration] = useState('');
  const [postes, setPostes] = useState('');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const m = mq.data;
  useEffect(() => {
    if (!m) return;
    setLieu(m.lieu ?? '');
    setDescription(m.description ?? '');
    setRemuneration(String(m.remunerationFcfa));
    setPostes(String(m.nombrePostes));
    setDate(m.date);
  }, [m?.id]);
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
            {m.lieu ? <View style={s.row}><Ionicons name="pin-outline" size={20} color={t.muted} /><AppText>Lieu exact : {m.lieu}</AppText></View> : null}
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

        {m && canManage && (
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
                  {c.statut === 'SELECTIONNEE' && <Button label="Message WhatsApp de sélection" variant="ghost" icon="logo-whatsapp" loading={act.busy === `wa${c.id}`} onPress={() => act.run(`wa${c.id}`, () => sendWhatsapp({ kind: 'MISSION_SELECTION', missionId: m.id, applicationId: c.id }))} />}
                  {c.statut === 'CONFIRMEE' && <Button label="Rappel WhatsApp" variant="ghost" icon="logo-whatsapp" loading={act.busy === `wr${c.id}`} onPress={() => act.run(`wr${c.id}`, () => sendWhatsapp({ kind: 'MISSION_REMINDER', missionId: m.id, workerId: c.travailleurId }))} />}
                  <Button label={detailId === c.id ? 'Masquer le détail' : 'Détail de la candidature'} variant="ghost" icon="information-circle-outline" onPress={() => setDetailId(detailId === c.id ? null : c.id)} />
                  {detailId === c.id && <CandidatDetails id={c.id} />}
                </Card>
              );
            })}

            {m.statut === 'BROUILLON' && <Button label="Publier la mission" icon="paper-plane" large loading={act.busy === 'pub'} onPress={() => act.run('pub', () => publishMission(m.id))} />}
            {m.statut === 'POURVUE' && <Button label="Démarrer la mission" icon="play" large loading={act.busy === 'start'} onPress={() => act.run('start', () => startMission(m.id))} />}
            {m.statut === 'EN_COURS' && <Button label="Terminer la mission" icon="flag" large loading={act.busy === 'done'} onPress={() => act.run('done', () => completeMission(m.id))} />}
            {confirmed > 0 && !['TERMINEE', 'CLOTUREE', 'ANNULEE'].includes(m.statut) && <Button label="Clôturer la mission" icon="flag" variant="secondary" large loading={act.busy === 'close'} onPress={() => act.run('close', () => closeMission(m.id))} />}
            {!['TERMINEE', 'CLOTUREE', 'ANNULEE'].includes(m.statut) && (askCancel
              ? <Button label="Oui, annuler la mission" variant="secondary" loading={act.busy === 'cancel'} onPress={() => act.run('cancel', () => cancelMission(m.id))} />
              : <Button label="Annuler la mission" variant="ghost" onPress={() => setAskCancel(true)} />)}

            <Card>
              <View style={s.titleRow}>
                <AppText variant="heading">Modifier la mission</AppText>
                <Button label={editing ? 'Fermer' : 'Modifier'} variant="ghost" icon="create-outline" onPress={() => setEditing(!editing)} />
              </View>
              {editing && (
                <>
                  <TextField label="Lieu exact" icon="pin-outline" value={lieu} onChangeText={setLieu} />
                  <TextField label="Description" icon="document-text-outline" value={description} onChangeText={setDescription} />
                  <TextField label="Rémunération (FCFA)" icon="cash-outline" keyboardType="number-pad" value={remuneration} onChangeText={(v) => setRemuneration(v.replace(/\D/g, ''))} />
                  <TextField label="Nombre de postes" icon="people-outline" keyboardType="number-pad" value={postes} onChangeText={(v) => setPostes(v.replace(/\D/g, ''))} />
                  <TextField label="Date (AAAA-MM-JJ)" icon="calendar-outline" value={date} onChangeText={setDate} />
                  <Button label="Enregistrer les modifications" icon="checkmark" loading={act.busy === 'edit'} disabled={!date || !remuneration || !postes}
                    onPress={() => act.run('edit', async () => {
                      await updateMission(m.id, {
                        lieu: lieu.trim() || null,
                        description: description.trim() || undefined,
                        remunerationFcfa: Number(remuneration),
                        nombrePostes: Number(postes),
                        dateMission: date,
                      });
                      setEditing(false);
                    })} />
                </>
              )}
            </Card>

            <Card>
              <View style={s.row}><Ionicons name="megaphone-outline" size={22} color={t.brand} /><AppText variant="heading">Diffuser la mission</AppText></View>
              <AppText muted>Sélectionnez jusqu’à 15 candidats de cette mission pour leur envoyer une proposition.</AppText>
              <View style={s.chips}>
                {cands.filter((c) => c.travailleurId).map((c) => {
                  const nom = c.travailleurNom ?? c.travailleurId.slice(0, 6);
                  const on = selected.includes(c.travailleurId);
                  return (
                    <Pressable key={c.id} accessibilityRole="button" accessibilityState={{ selected: on }}
                      onPress={() => setSelected(on ? selected.filter((id) => id !== c.travailleurId) : selected.length < 15 ? [...selected, c.travailleurId] : selected)}
                      style={[s.tag, { borderWidth: 1, borderColor: on ? t.brand : t.line, backgroundColor: on ? t.soft : t.card }]}>
                      <AppText variant="caption" color={on ? t.brand : t.muted}>{nom}</AppText>
                    </Pressable>
                  );
                })}
              </View>
              <Button label={`Diffuser dans l’application (${selected.length})`} icon="notifications-outline" disabled={!selected.length} loading={act.busy === 'bc'}
                onPress={() => act.run('bc', () => broadcastMission(m.id, selected))} />
              <Button label={`Envoyer par WhatsApp (${selected.length})`} icon="logo-whatsapp" variant="secondary" disabled={!selected.length} loading={act.busy === 'bwa'}
                onPress={() => act.run('bwa', () => sendWhatsapp({ kind: 'MISSION_PROPOSAL', missionId: m.id, workerIds: selected }))} />
              <Button label="Historique WhatsApp" variant="ghost" icon="time-outline" onPress={() => router.push('/whatsapp' as never)} />
            </Card>

            <Card>
              <AppText variant="heading">Supprimer la mission</AppText>
              <AppText muted>La mission sera retirée de la plateforme. Cette action est définitive.</AppText>
              {askDelete
                ? <Button label="Oui, supprimer définitivement" variant="secondary" loading={act.busy === 'del'}
                    onPress={() => act.run('del', async () => { await deleteMission(m.id); router.back(); })} />
                : <Button label="Supprimer la mission" variant="ghost" onPress={() => setAskDelete(true)} />}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CandidatDetails({ id }: { id: string }) {
  const t = useTheme();
  const q = useCandidature(id);
  if (q.isLoading) return <ActivityIndicator color={t.brand} />;
  if (q.isError) return <ErrorBox message="Impossible de charger l’historique de la candidature." />;
  const d = q.data;
  if (!d) return null;
  const hist: any[] = Array.isArray(d.historique) ? d.historique : [];
  return (
    <View style={[s.details, { borderTopColor: t.line }]}>
      <AppText variant="caption" muted>Reçue le {d.createdAt ? new Date(d.createdAt).toLocaleString('fr-FR') : '—'}{d.dateReponse ? ` · Réponse du ${new Date(d.dateReponse).toLocaleDateString('fr-FR')}` : ''}</AppText>
      {d.confirmation ? <AppText variant="caption">Confirmation : {d.confirmation.dateConfirmation ?? '—'} · présence {d.confirmation.presence ?? '—'}</AppText> : null}
      {hist.length
        ? hist.map((h) => (
          <View key={h.id} style={s.row}>
            <Ionicons name="time-outline" size={16} color={t.muted} />
            <AppText variant="caption" muted style={{ flex: 1 }}>{h.ancienStatut ? `${STATUT_CANDIDATURE[h.ancienStatut] ?? h.ancienStatut} → ` : ''}{STATUT_CANDIDATURE[h.nouveauStatut] ?? h.nouveauStatut} · {new Date(h.createdAt).toLocaleDateString('fr-FR')}</AppText>
          </View>
        ))
        : <AppText variant="caption" muted>Aucun changement de statut enregistré.</AppText>}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  back: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 16, maxWidth: 960, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  details: { gap: 6, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
});
