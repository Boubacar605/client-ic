import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../auth/session';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { TextField } from './TextField';
import { ErrorBox } from './ErrorBox';
import { useRecruiterProfile, useRecruiterProfileMutation, useWorkerCommissions, useWorkerEarnings, useWorkerProfile, useWorkerProfileMutation, useWorkerStats } from '../api/hooks';
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
  const wp = useWorkerProfile();
  const ws = useWorkerStats();
  const we = useWorkerEarnings();
  const wc = useWorkerCommissions();
  const rp = useRecruiterProfile();
  const updateWorker = useWorkerProfileMutation();
  const updateRecruiter = useRecruiterProfileMutation();
  const [raisonSociale, setRaisonSociale] = useState('');
  const [langue, setLangue] = useState('fr');
  const [materiel, setMateriel] = useState(false);
  useEffect(() => { if (rp.data) setRaisonSociale(rp.data.raisonSociale); }, [rp.data]);
  useEffect(() => { if (wp.data) { setLangue(wp.data.langue); setMateriel(wp.data.possedeSonMateriel); } }, [wp.data]);
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
          </View>
        </View>
        <View style={s.row}><Ionicons name="mail-outline" size={20} color={t.muted} /><AppText muted>{profil?.email}</AppText></View>
        {profil?.telephone ? <View style={s.row}><Ionicons name="call-outline" size={20} color={t.muted} /><AppText muted>{profil.telephone}</AppText></View> : null}
        {typeof profil?.scoreFiabilite === 'number' ? <View style={s.row}><Ionicons name="shield-checkmark-outline" size={20} color={t.muted} /><AppText muted>Fiabilité {Math.round(profil.scoreFiabilite)} %</AppText></View> : null}
      </Card>
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
        <TextField label="Langue" value={langue} onChangeText={setLangue} />
        <Button label={materiel ? 'Matériel disponible' : 'Pas de matériel'} variant="secondary" icon={materiel ? 'checkmark-circle-outline' : 'close-circle-outline'} onPress={() => setMateriel((v) => !v)} />
        {updateWorker.error ? <ErrorBox message="Impossible d’enregistrer le profil." /> : null}
        <Button label="Enregistrer mes préférences" loading={updateWorker.isPending} onPress={() => updateWorker.mutate({ langue, possedeSonMateriel: materiel, metierIds: wp.data!.metiers.map((m) => m.id), zoneIds: wp.data!.zones.map((z) => z.id) })} />
      </Card> : null}
      {recruiter && rp.data ? <Card>
        <AppText variant="heading">Profil recruteur</AppText>
        <TextField label="Raison sociale" value={raisonSociale} onChangeText={setRaisonSociale} />
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
  body: { padding: 20, paddingBottom: 140, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, marginTop: 4 },
});
