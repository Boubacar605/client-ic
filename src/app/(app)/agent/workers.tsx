import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAgentWorkers } from '../../../api/hooks';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';

export default function AgentWorkers() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useAgentWorkers();
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
      <AppText variant="display">Mes travailleurs</AppText>
      {q.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 30 }} />}
      {q.error && <ErrorBox message="Impossible de charger les travailleurs." />}
      {!q.isLoading && !q.error && (q.data?.data.length
        ? q.data.data.map((w) => (
          <Pressable key={w.id} accessibilityRole="button" accessibilityLabel={`Profil de ${w.nom}`} onPress={() => router.push(`/worker/${w.id}` as never)}>
            <Card>
              <View style={s.row}>
                {w.photoUrl
                  ? <Image source={{ uri: w.photoUrl }} style={s.avatar} resizeMode="cover" />
                  : <View style={[s.avatar, s.fallback, { backgroundColor: t.soft }]}><Ionicons name="person-outline" size={22} color={t.brand} /></View>}
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="heading" numberOfLines={1}>{w.nom}</AppText>
                  <AppText muted numberOfLines={1}>{w.metiers.map((m) => m.libelle).join(', ') || 'Métier non renseigné'}</AppText>
                  <AppText muted numberOfLines={1}>{w.zones.map((z) => z.nom).join(', ') || 'Zone non renseignée'}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={t.muted} />
              </View>
              <View style={s.row}>
                <AppText muted>{typeof w.scoreFiabilite === 'number' ? `${Math.round(w.scoreFiabilite)} % de fiabilité` : 'Fiabilité —'}</AppText>
                <AppText muted>{w.applicationsCount} candidature{w.applicationsCount > 1 ? 's' : ''}</AppText>
              </View>
            </Card>
          </Pressable>
        ))
        : <Card><AppText muted>Aucun travailleur géré pour le moment. Partagez votre code de parrainage pour recruter.</AppText></Card>)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
