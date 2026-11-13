import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useAgentDashboard } from '../../../api/hooks';
import { ApiError } from '../../../api/client';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';

export default function AgentDashboard() {
  const t = useTheme();
  const q = useAgentDashboard();
  const data = q.data as Record<string, any> | undefined;
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.body}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={t.brand} />}>
      <View style={s.head}><View><AppText variant="display">Espace agent</AppText><AppText muted>Accompagnez les talents au quotidien.</AppText></View><Ionicons name="sparkles-outline" size={32} color={t.brand} /></View>
      {q.isLoading ? <ActivityIndicator color={t.brand} /> : q.error ? <ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger le tableau de bord.'} /> : (
        <View style={s.grid}>
          <Card style={s.stat}><Ionicons name="people-outline" size={24} color={t.brand} /><AppText variant="title">{data?.workersCount ?? data?.travailleurs ?? '—'}</AppText><AppText muted>Travailleurs suivis</AppText></Card>
          <Card style={s.stat}><Ionicons name="send-outline" size={24} color={t.brand} /><AppText variant="title">{data?.proposalsCount ?? data?.propositions ?? '—'}</AppText><AppText muted>Propositions envoyées</AppText></Card>
        </View>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({ body: { padding: 20, gap: 18, paddingBottom: 120 }, head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, grid: { flexDirection: 'row', gap: 10 }, stat: { flex: 1, gap: 6 } });
