import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommissionStats, getMissionStats, getPlatformStats, listRestrictedWorkers } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { useSession } from '../../../auth/session';
import { fcfa } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { ErrorBox } from '../../../ui/ErrorBox';
import { ListRow } from '../../../ui/ListRow';
import { SectionHeader } from '../../../ui/SectionHeader';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

// Tableau de bord du back-office : santé de la plateforme et accès rapides.
export default function AdminHome() {
  const t = useTheme();
  const router = useRouter();
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  const platform = useQuery({ queryKey: ['admin-platform-stats'], queryFn: getPlatformStats });
  const missions = useQuery({ queryKey: ['admin-mission-stats'], queryFn: getMissionStats });
  const commissions = useQuery({ queryKey: ['admin-commission-stats'], queryFn: getCommissionStats });
  const restricted = useQuery({ queryKey: ['admin-restricted-workers'], queryFn: () => listRestrictedWorkers() });
  const error = platform.error ?? missions.error ?? commissions.error;
  const refresh = () => { platform.refetch(); missions.refetch(); commissions.refetch(); restricted.refetch(); };

  const p = platform.data ?? {};
  const platformStats: StatItem[] = [
    { key: 'users', label: 'Comptes', value: p.usersTotal, icon: 'people-outline' },
    { key: 'workers', label: 'Travailleurs', value: p.workersTotal, icon: 'hammer-outline' },
    { key: 'recruiters', label: 'Recruteurs', value: p.recruitersTotal, icon: 'briefcase-outline' },
    { key: 'agents', label: 'Agents', value: p.agentsTotal, icon: 'sparkles-outline' },
    { key: 'premium', label: 'Comptes premium', value: p.premiumUsers, icon: 'star-outline', accent: 'amber' },
    { key: 'restricted', label: 'Comptes restreints', value: restricted.data?.total, icon: 'lock-closed-outline', accent: 'danger' },
  ];
  const activityStats: StatItem[] = [
    { key: 'published', label: 'Missions publiées', value: p.missionsPublished, icon: 'megaphone-outline' },
    { key: 'applications', label: 'Candidatures', value: p.applicationsTotal, icon: 'paper-plane-outline' },
    { key: 'outstanding', label: 'Commissions dues', value: typeof p.commissionsOutstanding === 'number' ? fcfa(p.commissionsOutstanding) : undefined, icon: 'cash-outline', accent: 'amber' },
    { key: 'notifications', label: 'Notifications envoyées', value: p.notificationsSent, icon: 'notifications-outline' },
    { key: 'whatsapp', label: 'Messages WhatsApp', value: p.whatsappMessagesSent, icon: 'logo-whatsapp' },
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

      <View style={s.section}>
        <SectionHeader title="La plateforme" caption="Comptes et communautés." actionLabel="Actualiser" onAction={refresh} />
        <StatGrid items={platformStats} />
      </View>

      <View style={s.section}>
        <SectionHeader title="Activité" caption="Missions, candidatures et flux financiers." />
        <StatGrid items={activityStats} />
      </View>

      <View style={s.section}>
        <SectionHeader title="Accès rapides" caption="Les actions de pilotage courantes." />
        <View style={s.actions}>
          <View style={{ flex: 1 }}><Button label="Créer un compte" icon="person-add-outline" onPress={() => router.navigate('/admin/nouveau-compte')} /></View>
          <View style={{ flex: 1 }}><Button label="Référentiels" icon="albums-outline" variant="secondary" onPress={() => router.navigate('/admin/referentiels')} /></View>
        </View>
      </View>

      <View style={s.section}>
        <SectionHeader title="Gestion de la plateforme" caption="Ouvrez un module pour agir." />
        <ListRow title="Missions" icon="pulse-outline"
          subtitle={`Total ${missions.data?.total ?? '—'} · Publiées ${missions.data?.published ?? '—'} · Terminées ${missions.data?.completed ?? '—'}`}
          onPress={() => router.navigate('/admin/missions')} />
        <ListRow title="Commissions" icon="cash-outline"
          subtitle={`Encaissées ${typeof commissions.data?.paid === 'number' ? fcfa(commissions.data.paid) : '—'} · Restant dû ${typeof commissions.data?.outstanding === 'number' ? fcfa(commissions.data.outstanding) : '—'}`}
          trailing={`${commissions.data?.entries ?? '—'} lignes`} trailingColor={t.muted}
          onPress={() => router.navigate('/admin/commissions')} />
        <ListRow title="Comptes restreints" icon="lock-closed-outline"
          subtitle={`${restricted.data?.total ?? 0} travailleur(s) dépassent le seuil de dette autorisé.`}
          trailing={`${restricted.data?.total ?? 0} compte(s)`} trailingColor={t.error}
          onPress={() => router.navigate('/admin/users')} />
      </View>

      <View style={s.section}>
        <SectionHeader title="Session" caption="Fermer votre accès administrateur." />
        <Button label="Se déconnecter" icon="log-out-outline" variant="secondary" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 22, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  section: { gap: 12 },
});
