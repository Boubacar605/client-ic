import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAgentDashboard } from '../../../api/hooks';
import { ApiError } from '../../../api/client';
import { fdate, STATUT_CANDIDATURE } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { StatGrid, StatItem } from '../../../ui/StatGrid';

type AgentWorker = { id: string; nom: string; scoreFiabilite: number | null; createdAt: string };
type AgentActivity = { id: string; statut: string; createdAt: string; workerName: string; missionId: string; mission: string };

export default function AgentDashboard() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useAgentDashboard();
  const data = q.data as Record<string, any> | undefined;
  const ds = data?.stats ?? {};
  const workers: AgentWorker[] = Array.isArray(data?.workers) ? data.workers : [];
  const activity: AgentActivity[] = Array.isArray(data?.recentActivity) ? data.recentActivity : [];
  const stats: StatItem[] = [
    { key: 'managed', label: 'Travailleurs suivis', value: ds.workersManaged, icon: 'people-outline' },
    { key: 'active', label: 'Comptes actifs', value: ds.activeWorkers, icon: 'person-circle-outline' },
    { key: 'applications', label: 'Candidatures générées', value: ds.applicationsGenerated, icon: 'paper-plane-outline' },
    { key: 'confirmed', label: 'Confirmations reçues', value: ds.confirmationsReceived, icon: 'checkmark-done-outline' },
  ];
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
      <View style={s.head}>
        <View style={{ flex: 1 }}><AppText variant="display">Espace agent</AppText><AppText muted>Accompagnez les talents au quotidien.</AppText></View>
        <Ionicons name="sparkles-outline" size={32} color={t.brand} />
      </View>
      {q.isLoading ? <ActivityIndicator color={t.brand} /> : q.error ? <ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger le tableau de bord.'} /> : (
        <>
          <StatGrid items={stats} />
          <View style={s.actions}>
            <View style={{ flex: 1 }}><Button label="Proposer une mission" icon="send-outline" onPress={() => router.navigate('/agent/proposal')} /></View>
            <View style={{ flex: 1 }}><Button label="Mes travailleurs" icon="people-outline" variant="secondary" onPress={() => router.navigate('/agent/workers')} /></View>
          </View>
          <Button label="Historique WhatsApp" icon="logo-whatsapp" variant="ghost" onPress={() => router.push('/whatsapp' as never)} />

          {workers.length > 0 && (
            <View style={{ gap: 10 }}>
              <AppText variant="heading">Derniers inscrits dans votre portefeuille</AppText>
              {workers.slice(0, 5).map((w) => (
                <Pressable key={w.id} accessibilityRole="button" accessibilityLabel={`Profil de ${w.nom}`} onPress={() => router.push(`/worker/${w.id}` as never)}>
                  <Card style={{ padding: 14, gap: 4 }}>
                    <View style={s.rowBetween}>
                      <AppText variant="label" numberOfLines={1}>{w.nom}</AppText>
                      <View style={s.rowBetween}>
                        <AppText variant="caption" color={t.brand}>{w.scoreFiabilite !== null ? `${Math.round(w.scoreFiabilite)} %` : 'Nouveau'}</AppText>
                        <Ionicons name="chevron-forward" size={18} color={t.muted} />
                      </View>
                    </View>
                    <AppText variant="caption" muted>Inscrit le {fdate(w.createdAt.slice(0, 10))}</AppText>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}

          {activity.length > 0 && (
            <View style={{ gap: 10 }}>
              <AppText variant="heading">Activité récente</AppText>
              {activity.slice(0, 6).map((a) => (
                <Card key={a.id} style={{ padding: 14, gap: 4 }}>
                  <View style={s.rowBetween}>
                    <AppText variant="label" numberOfLines={1}>{a.workerName}</AppText>
                    <AppText variant="caption" color={t.brand}>{STATUT_CANDIDATURE[a.statut] ?? a.statut}</AppText>
                  </View>
                  <AppText variant="caption" muted numberOfLines={1}>{a.mission}</AppText>
                  <Button label="Voir la mission" variant="ghost" icon="chevron-forward" onPress={() => router.push({ pathname: '/mission/[id]', params: { id: a.missionId } })} />
                </Card>
              ))}
            </View>
          )}

          {!workers.length && !activity.length && <Card><AppText muted>Aucun travailleur dans votre portefeuille pour le moment. Partagez votre code de parrainage pour en recruter.</AppText></Card>}
        </>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  body: { padding: 20, gap: 18, paddingBottom: 120, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
});
