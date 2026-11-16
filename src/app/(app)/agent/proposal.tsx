import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { useAgentWorkers } from '../../../api/hooks';
import { listPublicMissions } from '../../../api/missions';
import { useReference } from '../../../api/reference';
import { createAgentProposal } from '../../../api/roles';
import { sendWhatsapp } from '../../../api/whatsapp';
import { useSession } from '../../../auth/session';
import { fdate } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';

export default function AgentProposal() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { profil } = useSession();
  const workers = useAgentWorkers();
  const ref = useReference();
  const missions = useQuery({ queryKey: ['missions', 'public', 'agent'], enabled: !!ref.data, queryFn: () => listPublicMissions(ref.data!) });
  const [workerIds, setWorkerIds] = useState<string[]>([]);
  const [missionId, setMission] = useState<string | null>(null);
  const [busy, setBusy] = useState<'app' | 'wa' | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const MAX = 15;

  const toggleWorker = (id: string) => setWorkerIds((prev) => (
    prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX ? [...prev, id] : prev
  ));

  async function proposerDansApp() {
    if (!missionId || !workerIds.length) return;
    setError(null); setNotice(null); setBusy('app');
    const results = await Promise.allSettled(workerIds.map((travailleurId) => createAgentProposal({ travailleurId, missionId })));
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    setBusy(null);
    if (ok) {
      setNotice(`${ok} proposition${ok > 1 ? 's' : ''} envoyée${ok > 1 ? 's' : ''}${failed ? ` · ${failed} échec${failed > 1 ? 's' : ''}` : ''}.`);
      qc.invalidateQueries({ queryKey: ['agent-dashboard'] });
    }
    if (failed) setError(new ApiError(0, 'PROPOSITION_PARTIEL', `${failed} proposition${failed > 1 ? 's' : ''} n’${failed > 1 ? 'ont' : 'a'} pas pu être envoyée${failed > 1 ? 's' : ''}.`));
  }

  async function envoyerWhatsApp() {
    if (!missionId || !workerIds.length) return;
    setError(null); setNotice(null); setBusy('wa');
    const report = (sent: number, skipped: number, failed: number) => {
      setNotice(`WhatsApp : ${sent} message${sent > 1 ? 's' : ''} envoyé${sent > 1 ? 's' : ''} sur ${workerIds.length}${skipped ? ` · ${skipped} ignoré${skipped > 1 ? 's' : ''} (profil ou disponibilité incompatible)` : ''}${failed ? ` · ${failed} échec${failed > 1 ? 's' : ''}` : ''}.`);
    };
    const countStatuses = (results: { status?: string }[]) => {
      const sent = results.filter((r) => r.status === 'SENT').length;
      const failed = results.filter((r) => r.status === 'FAILED').length;
      return { sent, failed, skipped: results.length - sent - failed };
    };
    try {
      try {
        const res = await sendWhatsapp({ kind: 'MISSION_PROPOSAL', missionId, workerIds });
        const results: { status?: string }[] = Array.isArray(res?.results) ? res.results : [];
        const { sent, failed, skipped } = countStatuses(results);
        report(sent, skipped, failed);
      } catch (e) {
        if (e instanceof ApiError && e.code === 'PREMIUM_REQUIRED') throw e;
        // Le lot est refusé en bloc si un travailleur est incompatible : on réessaie un par un.
        let sent = 0, skipped = 0, failed = 0;
        for (const workerId of workerIds) {
          try {
            const res = await sendWhatsapp({ kind: 'MISSION_PROPOSAL', missionId, workerIds: [workerId] });
            const status = Array.isArray(res?.results) ? res.results[0]?.status : undefined;
            if (status === 'SENT') sent += 1;
            else if (status === 'FAILED') failed += 1;
            else skipped += 1;
          } catch (inner) {
            if (inner instanceof ApiError && inner.code === 'PREMIUM_REQUIRED') throw inner;
            if (inner instanceof ApiError && (inner.status === 400 || inner.code === 'COMMISSION_PAYMENT_REQUIRED')) skipped += 1;
            else failed += 1;
          }
        }
        report(sent, skipped, failed);
      }
      qc.invalidateQueries({ queryKey: ['whatsapp-history'] });
      qc.invalidateQueries({ queryKey: ['agent-dashboard'] });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PREMIUM_REQUIRED') {
        setError(new ApiError(e.status, e.code, 'La diffusion WhatsApp est réservée aux comptes Premium. Demandez son activation à un administrateur.'));
      } else {
        setError(e instanceof ApiError ? e : new ApiError(0, 'WHATSAPP_ECHEC', 'Impossible d’envoyer les messages WhatsApp.'));
      }
    } finally {
      setBusy(null);
    }
  }
  const workerList = workers.data?.data ?? [];
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <AppText variant="display">Proposer une mission</AppText>

      <Card>
        <AppText variant="heading">1. Choisir les travailleurs</AppText>
        <AppText muted variant="caption">Sélectionnez jusqu’à {MAX} travailleurs de votre portefeuille.</AppText>
        {workers.isLoading && <ActivityIndicator color={t.brand} />}
        {workers.isError && <ErrorBox message="Impossible de charger vos travailleurs." />}
        {!workers.isLoading && !workerList.length && <AppText muted>Aucun travailleur dans votre portefeuille.</AppText>}
        {workerList.map((w) => {
          const active = workerIds.includes(w.id);
          return (
            <Pressable key={w.id} accessibilityRole="checkbox" accessibilityState={{ checked: active }} onPress={() => toggleWorker(w.id)}
              style={[s.option, { borderColor: active ? t.brand : t.line, backgroundColor: active ? t.soft : t.card }]}>
              <Ionicons name={active ? 'checkbox' : 'square-outline'} size={22} color={active ? t.brand : t.muted} />
              <View style={{ flex: 1 }}>
                <AppText variant="label">{w.nom}</AppText>
                <AppText variant="caption" muted numberOfLines={1}>{(w.metiers ?? []).map((m) => m.libelle).join(', ') || 'Métier non renseigné'}</AppText>
              </View>
              <AppText variant="caption" color={t.brand}>{w.scoreFiabilite !== null ? `${Math.round(w.scoreFiabilite)} %` : 'Nouveau'}</AppText>
            </Pressable>
          );
        })}
        <AppText variant="caption" muted>{workerIds.length} / {MAX} sélectionné{workerIds.length > 1 ? 's' : ''}</AppText>
      </Card>

      <Card>
        <AppText variant="heading">2. Choisir une mission</AppText>
        {missions.isLoading && <ActivityIndicator color={t.brand} />}
        {missions.isError && <ErrorBox message="Impossible de charger les missions ouvertes." />}
        {!missions.isLoading && !(missions.data ?? []).length && <AppText muted>Aucune mission ouverte pour le moment.</AppText>}
        {(missions.data ?? []).map((m) => {
          const active = missionId === m.id;
          return (
            <Pressable key={m.id} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setMission(m.id)}
              style={[s.option, { borderColor: active ? t.brand : t.line, backgroundColor: active ? t.soft : t.card }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" numberOfLines={1}>{m.metier} · {m.zone}</AppText>
                <AppText variant="caption" muted numberOfLines={1}>{fdate(m.date)} · {m.lieu ?? m.zone}</AppText>
              </View>
              <AppText variant="caption" color={t.brand}>{m.nombrePostes} poste{m.nombrePostes > 1 ? 's' : ''}</AppText>
            </Pressable>
          );
        })}
      </Card>

      {error ? <ErrorBox message={error.title} /> : null}
      {notice ? <AppText color={t.brand} style={{ fontWeight: '700' }}>{notice}</AppText> : null}
      <Button label={`Proposer dans l’application (${workerIds.length})`} loading={busy === 'app'} disabled={!missionId || !workerIds.length || busy !== null} icon="send-outline" onPress={proposerDansApp} />
      <Button label={`Envoyer par WhatsApp (${workerIds.length})`} variant="secondary" loading={busy === 'wa'} disabled={!missionId || !workerIds.length || busy !== null} icon="logo-whatsapp" onPress={envoyerWhatsApp} />
      {profil?.role === 'AGENT' && profil?.isPremium === false ? (
        <AppText variant="caption" muted>La diffusion WhatsApp nécessite un compte Premium, activé par un administrateur.</AppText>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
});
