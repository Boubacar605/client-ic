import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommissionStats, getMissionStats, getPlatformStats, listRestrictedWorkers } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { fcfa } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

// Tableau de bord du back-office : santé de la plateforme et accès rapides.
export default function AdminHome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const platform = useQuery({ queryKey: ['admin-platform-stats'], queryFn: getPlatformStats });
  const missions = useQuery({ queryKey: ['admin-mission-stats'], queryFn: getMissionStats });
  const commissions = useQuery({ queryKey: ['admin-commission-stats'], queryFn: getCommissionStats });
  const restricted = useQuery({ queryKey: ['admin-restricted-workers'], queryFn: () => listRestrictedWorkers() });
  const error = platform.error ?? missions.error ?? commissions.error;
  const refresh = () => { platform.refetch(); missions.refetch(); commissions.refetch(); restricted.refetch(); };

  const p = platform.data ?? {};
  const stats: StatItem[] = [
    { key: 'users', label: 'Comptes', value: p.usersTotal, icon: 'people-outline' },
    { key: 'workers', label: 'Travailleurs', value: p.workersTotal, icon: 'hammer-outline' },
    { key: 'recruiters', label: 'Recruteurs', value: p.recruitersTotal, icon: 'briefcase-outline' },
    { key: 'agents', label: 'Agents', value: p.agentsTotal, icon: 'sparkles-outline' },
    { key: 'premium', label: 'Comptes premium', value: p.premiumUsers, icon: 'star-outline', accent: 'amber' },
    { key: 'published', label: 'Missions publiées', value: p.missionsPublished, icon: 'megaphone-outline' },
    { key: 'applications', label: 'Candidatures', value: p.applicationsTotal, icon: 'paper-plane-outline' },
    { key: 'outstanding', label: 'Commissions dues', value: typeof p.commissionsOutstanding === 'number' ? fcfa(p.commissionsOutstanding) : undefined, icon: 'cash-outline', accent: 'amber' },
    { key: 'notifications', label: 'Notifications envoyées', value: p.notificationsSent, icon: 'notifications-outline' },
    { key: 'whatsapp', label: 'Messages WhatsApp', value: p.whatsappMessagesSent, icon: 'logo-whatsapp' },
    { key: 'restricted', label: 'Comptes restreints', value: restricted.data?.total, icon: 'lock-closed-outline', accent: 'danger' },
  ];

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={platform.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={s.heading}>
        <View style={{ flex: 1 }}>
          <AppText variant="display">Pilotage</AppText>
          <AppText muted>La plateforme en un regard.</AppText>
        </View>
        <Ionicons name="shield-checkmark" size={34} color={t.brand} />
      </View>

      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les données administrateur.'} />}
      {platform.isLoading && <ActivityIndicator color={t.brand} />}
      <StatGrid items={stats} />

      <View style={s.actions}>
        <View style={{ flex: 1 }}><Button label="Créer un compte" icon="person-add-outline" onPress={() => router.navigate('/admin/nouveau-compte')} /></View>
        <View style={{ flex: 1 }}><Button label="Référentiels" icon="albums-outline" variant="secondary" onPress={() => router.navigate('/admin/referentiels')} /></View>
      </View>

      <Card>
        <View style={s.row}><Ionicons name="pulse-outline" size={22} color={t.brand} /><AppText variant="heading">Missions</AppText></View>
        <AppText muted>Total : {missions.data?.total ?? '—'} · Publiées : {missions.data?.published ?? '—'} · Terminées : {missions.data?.completed ?? '—'}</AppText>
        {Array.isArray(missions.data?.byStatus) && missions.data!.byStatus.length > 0 && (
          <View style={s.chips}>
            {missions.data!.byStatus.map((row: { statut: string; count: number }) => (
              <View key={row.statut} style={[s.chip, { backgroundColor: t.soft }]}>
                <AppText variant="caption" color={t.brand}>{row.statut} · {row.count}</AppText>
              </View>
            ))}
          </View>
        )}
        <Button label="Gérer les missions" variant="ghost" icon="chevron-forward" onPress={() => router.navigate('/admin/missions')} />
      </Card>

      <Card>
        <View style={s.row}><Ionicons name="cash-outline" size={22} color={t.brand} /><AppText variant="heading">Commissions</AppText></View>
        <AppText muted>Générées : {typeof commissions.data?.generated === 'number' ? fcfa(commissions.data.generated) : '—'}</AppText>
        <AppText muted>Encaissées : {typeof commissions.data?.paid === 'number' ? fcfa(commissions.data.paid) : '—'}</AppText>
        <AppText muted>Restant dû : {typeof commissions.data?.outstanding === 'number' ? fcfa(commissions.data.outstanding) : '—'} · {commissions.data?.entries ?? '—'} lignes</AppText>
        <Button label="Suivre les commissions" variant="ghost" icon="chevron-forward" onPress={() => router.navigate('/admin/commissions')} />
      </Card>

      <Card>
        <View style={s.row}><Ionicons name="lock-closed-outline" size={22} color={t.amber} /><AppText variant="heading">Comptes restreints</AppText></View>
        <AppText muted>{restricted.data?.total ?? 0} travailleur(s) dépassent le seuil de dette autorisé.</AppText>
        <Button label="Actualiser les données" icon="refresh" variant="secondary" onPress={refresh} />
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 16, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
});
