import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../auth/session';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { TextField } from './TextField';
import { ErrorBox } from './ErrorBox';
import { useRecruiterProfile, useRecruiterProfileMutation, useWorkerCommissions, useWorkerEarnings, useWorkerProfile, useWorkerProfileMutation, useWorkerStats } from '../api/hooks';
import { useReference } from '../api/reference';
import { MetierThumb } from './MetierThumb';
import { MetierTile } from './MetierTile';
import { ProfilePhotoCard } from './ProfilePhotoCard';

const ROLE: Record<string, string> = { TRAVAILLEUR: 'Travailleur', RECRUTEUR: 'Recruteur', AGENT: 'Agent', ADMINISTRATEUR: 'Administrateur' };

// Écran de profil partagé par les deux espaces.
export function ProfilView() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profil, signOut } = useSession();
  const worker = profil?.role === 'TRAVAILLEUR';
  const recruiter = profil?.role === 'RECRUTEUR';
  const wp = useWorkerProfile(worker);
  const ws = useWorkerStats(worker);
  const we = useWorkerEarnings(worker);
  const wc = useWorkerCommissions(worker);
  const rp = useRecruiterProfile(recruiter);
  const ref = useReference();
  const updateWorker = useWorkerProfileMutation();
  const updateRecruiter = useRecruiterProfileMutation();
  const [raisonSociale, setRaisonSociale] = useState('');
  const [langue, setLangue] = useState('fr');
  const [materiel, setMateriel] = useState(false);
  const [metierIds, setMetierIds] = useState<string[]>([]);
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [editMetiers, setEditMetiers] = useState(false);
  const [editZones, setEditZones] = useState(false);
  useEffect(() => { if (rp.data) setRaisonSociale(rp.data.raisonSociale); }, [rp.data]);
  useEffect(() => { if (wp.data) { setLangue(wp.data.langue); setMateriel(wp.data.possedeSonMateriel); setMetierIds((wp.data.metiers ?? []).map((m) => m.id)); setZoneIds((wp.data.zones ?? []).map((z) => z.id)); } }, [wp.data?.id]);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const zoneById = ref.data?.zoneById;
  const metierById = ref.data?.metierById;
  const initiales = (profil?.nom ?? profil?.email ?? '?').split(/[ @]/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <AppText variant="display">Mon profil</AppText>
      <ProfilePhotoCard photoUrl={worker ? wp.data?.photoUrl : rp.data?.photoUrl} queryKeys={worker ? [['worker-profile'], ['bootstrap']] : [['recruiter-profile'], ['bootstrap']]} />
      <Card>
        <View style={s.row}>
          <View style={[s.avatar, { backgroundColor: t.sun }]}><AppText variant="title" color="#14201c">{initiales}</AppText></View>
          <View style={{ flex: 1 }}>
            <AppText variant="heading" numberOfLines={1}>{profil?.nom ?? 'Mon compte'}</AppText>
            <View style={[s.pill, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand}>{ROLE[profil?.role ?? ''] ?? profil?.role}</AppText></View>
            {(profil?.role === 'RECRUTEUR' || profil?.role === 'AGENT') && (
              <View style={[s.pill, { backgroundColor: profil?.isPremium ? t.sunSoft : t.soft }]}>
                <Ionicons name={profil?.isPremium ? 'star' : 'star-outline'} size={13} color={profil?.isPremium ? t.amber : t.muted} />
                <AppText variant="caption" color={profil?.isPremium ? t.amber : t.muted}>{profil?.isPremium ? 'Compte Premium' : 'Compte standard'}</AppText>
              </View>
            )}
          </View>
        </View>
        <View style={s.row}><Ionicons name="mail-outline" size={20} color={t.muted} /><AppText muted>{profil?.email}</AppText></View>
        {profil?.telephone ? <View style={s.row}><Ionicons name="call-outline" size={20} color={t.muted} /><AppText muted>{profil.telephone}</AppText></View> : null}
        {typeof profil?.scoreFiabilite === 'number' ? <View style={s.row}><Ionicons name="shield-checkmark-outline" size={20} color={t.muted} /><AppText muted>Fiabilité {Math.round(profil.scoreFiabilite)} %</AppText></View> : null}
      </Card>
      {worker && wp.data?.agent ? <Card>
        <View style={s.row}><Ionicons name="people-outline" size={22} color={t.brand} /><AppText variant="heading">Mon agent référent</AppText></View>
        <AppText variant="label">{wp.data.agent.nom}</AppText>
        {wp.data.agent.codeParrainage ? <AppText muted>Code agent : {wp.data.agent.codeParrainage}</AppText> : null}
        <AppText muted variant="caption">Il vous accompagne et peut vous proposer des missions.</AppText>
      </Card> : null}
      {worker && (ws.data || we.data) ? <Card>
        <AppText variant="heading">Mon activité</AppText>
        <View style={s.stats}>
          <View><AppText variant="title" color={t.brand}>{ws.data?.completedMissions ?? we.data?.completedMissions ?? 0}</AppText><AppText muted>missions terminées</AppText></View>
          <View><AppText variant="title" color={t.brand}>{we.data?.netRevenue ?? 0} F</AppText><AppText muted>revenus nets</AppText></View>
          <View><AppText variant="title" color={t.brand}>{ws.data?.scoreFiabilite ?? 0}%</AppText><AppText muted>fiabilité</AppText></View>
        </View>
        {wc.data ? <AppText muted>Commissions restantes : {wc.data.remainingCommission ?? 0} F · Statut : {wc.data.status ?? '—'}</AppText> : null}
      </Card> : null}
      {worker && wp.data ? <Card>
        <AppText variant="heading">Préférences travailleur</AppText>
        <TextField label="Langue" placeholder="Ex. Français" value={langue} onChangeText={setLangue} />
        <Button label={materiel ? 'Matériel disponible' : 'Pas de matériel'} variant="secondary" icon={materiel ? 'checkmark-circle-outline' : 'close-circle-outline'} onPress={() => setMateriel((v) => !v)} />

        <View style={{ gap: 8 }}>
          <View style={s.row}><AppText variant="label" style={{ flex: 1 }}>Mes métiers ({metierIds.length})</AppText>
            <Button label={editMetiers ? 'Terminer' : 'Modifier'} variant="ghost" onPress={() => setEditMetiers((v) => !v)} /></View>
          {metierIds.length > 0
            ? <View style={s.wrap}>{metierIds.map((id) => <View key={id} style={[s.chip, { backgroundColor: t.soft }]}><MetierThumb metier={metierById?.get(id)?.libelle ?? ''} size={22} radius={7} /><AppText variant="caption" color={t.brand} style={{ fontWeight: '700' }}>{metierById?.get(id)?.libelle ?? 'Métier'}</AppText></View>)}</View>
            : <AppText muted variant="caption">Aucun métier sélectionné : choisissez-en au moins un pour recevoir des missions.</AppText>}
          {editMetiers && (
            <View style={s.grid}>
              {(ref.data?.metiers ?? []).map((m) => (
                <MetierTile key={m.id} metier={m.libelle} width={86} selected={metierIds.includes(m.id)} onPress={() => setMetierIds((prev) => toggle(prev, m.id))} />
              ))}
            </View>
          )}
        </View>

        <View style={{ gap: 8 }}>
          <View style={s.row}><AppText variant="label" style={{ flex: 1 }}>Mes zones ({zoneIds.length})</AppText>
            <Button label={editZones ? 'Terminer' : 'Modifier'} variant="ghost" onPress={() => setEditZones((v) => !v)} /></View>
          {zoneIds.length > 0
            ? <View style={s.wrap}>{zoneIds.map((id) => <View key={id} style={[s.chip, { backgroundColor: t.soft }]}><Ionicons name="location-outline" size={14} color={t.brand} /><AppText variant="caption" color={t.brand} style={{ fontWeight: '700' }}>{zoneById?.get(id)?.nom ?? 'Zone'}</AppText></View>)}</View>
            : <AppText muted variant="caption">Aucune zone : indiquez où vous pouvez travailler.</AppText>}
          {editZones && (
            <View style={s.wrap}>
              {(ref.data?.zones ?? []).map((z) => {
                const on = zoneIds.includes(z.id);
                return (
                  <Pressable key={z.id} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={z.nom}
                    onPress={() => setZoneIds((prev) => toggle(prev, z.id))}
                    style={[s.chip, { borderWidth: 1, borderColor: on ? t.brand : t.line, backgroundColor: on ? t.soft : t.card }]}>
                    <AppText variant="caption" color={on ? t.brand : t.muted} style={on ? { fontWeight: '700' } : undefined}>{z.nom}</AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {updateWorker.error ? <ErrorBox message="Impossible d’enregistrer le profil." /> : null}
        <Button label="Enregistrer mes préférences" loading={updateWorker.isPending} disabled={metierIds.length === 0}
          onPress={() => updateWorker.mutate({ langue, possedeSonMateriel: materiel, metierIds, zoneIds })} />
      </Card> : null}
      {recruiter && rp.data ? <Card>
        <AppText variant="heading">Profil recruteur</AppText>
        <TextField label="Raison sociale" placeholder="Ex. BTP Sénégal SARL" value={raisonSociale} onChangeText={setRaisonSociale} />
        {updateRecruiter.error ? <ErrorBox message="Impossible d’enregistrer la raison sociale." /> : null}
        <Button label="Enregistrer" loading={updateRecruiter.isPending} onPress={() => updateRecruiter.mutate({ raisonSociale })} />
      </Card> : null}
      <Card>
        <View style={s.row}><Ionicons name="contrast-outline" size={22} color={t.brand} /><AppText variant="label">Apparence</AppText></View>
        <AppText muted>L’application suit le mode clair ou sombre de votre téléphone.</AppText>
      </Card>
      <Button label="Diagnostic et serveur" variant="secondary" icon="construct-outline" onPress={() => router.push('/debug')} />
      <Button label="Se déconnecter" icon="log-out-outline" large onPress={signOut} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 16, maxWidth: 760, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
});
