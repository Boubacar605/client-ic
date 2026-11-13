import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { getMissionStats, getPlatformStats, listAdminUsers, listCommissions } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ErrorBox } from '../../ui/ErrorBox';
import { useSession } from '../../auth/session';

const cards = [
  ['usersTotal', 'Utilisateurs', 'people-outline'],
  ['missionsPublished', 'Missions publiées', 'briefcase-outline'],
  ['applicationsTotal', 'Candidatures', 'paper-plane-outline'],
  ['commissionsOutstanding', 'Commissions dues', 'cash-outline'],
] as const;

export default function AdminHome() {
  const { profil } = useSession();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const stats = useQuery({ queryKey: ['admin-platform-stats'], queryFn: getPlatformStats });
  const missions = useQuery({ queryKey: ['admin-mission-stats'], queryFn: getMissionStats });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: () => listAdminUsers({ page: 1, limit: 8 }) });
  const commissions = useQuery({ queryKey: ['admin-commissions'], queryFn: () => listCommissions({ page: 1, limit: 5 }) });
  const error = stats.error ?? missions.error ?? users.error ?? commissions.error;
  const refresh = () => { stats.refetch(); missions.refetch(); users.refetch(); commissions.refetch(); };
  if (profil && profil.role !== 'ADMINISTRATEUR') return <Redirect href={profil.role === 'AGENT' ? '/agent' : profil.role === 'RECRUTEUR' ? '/recruteur' : '/travailleur'} />;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={stats.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={s.heading}><View><AppText variant="display">Pilotage</AppText><AppText muted>La plateforme en un regard.</AppText></View><Ionicons name="shield-checkmark" size={34} color={t.brand} /></View>
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les données administrateur.'} />}
      {(stats.isLoading || missions.isLoading) && <ActivityIndicator color={t.brand} />}
      <View style={s.grid}>{cards.map(([key, label, icon]) => (
        <Card key={key} style={s.stat}><Ionicons name={icon} size={24} color={t.brand} /><AppText variant="title">{stats.data?.[key] ?? '—'}</AppText><AppText variant="caption" muted>{label}</AppText></Card>
      ))}</View>
      <Card><View style={s.row}><Ionicons name="pulse-outline" size={22} color={t.brand} /><AppText variant="heading">Activité des missions</AppText></View><AppText muted>Total : {missions.data?.total ?? missions.data?.missionsTotal ?? '—'}</AppText></Card>
      <Card><View style={s.row}><Ionicons name="people-outline" size={22} color={t.brand} /><AppText variant="heading">Derniers utilisateurs</AppText></View>
        {users.data?.data?.length ? users.data.data.map((u) => <View key={u.id} style={s.item}><AppText>{u.nom}</AppText><AppText variant="caption" muted>{u.role} · {u.statut}</AppText></View>) : <AppText muted>Aucun utilisateur à afficher.</AppText>}
      </Card>
      <Card><View style={s.row}><Ionicons name="cash-outline" size={22} color={t.brand} /><AppText variant="heading">Commissions</AppText></View><AppText muted>{commissions.data?.total ?? '—'} commissions suivies</AppText></Card>
      <Button label="Actualiser les données" icon="refresh" variant="secondary" onPress={refresh} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 16 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d9e1dc' },
});
