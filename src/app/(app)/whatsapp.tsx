import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../api/client';
import { whatsappHistory } from '../../api/whatsapp';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { Card } from '../../ui/Card';
import { ErrorBox } from '../../ui/ErrorBox';

const STATUT: Record<string, string> = {
  EN_FILE: 'En file', ENVOYE: 'Envoyé', LIVRE: 'Livré', LU: 'Lu', ECHEC: 'Échec',
};
const TYPE: Record<string, string> = {
  MISSION_PROPOSAL: 'Proposition de mission',
  MISSION_SELECTION: 'Sélection',
  MISSION_REMINDER: 'Rappel',
};

// Journal des messages WhatsApp envoyés par l'utilisateur connecté (recruteur ou agent).
export default function WhatsAppHistory() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useQuery({ queryKey: ['whatsapp-history'], queryFn: whatsappHistory });
  const rows = q.data ?? [];
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={22} color={t.text} /></Pressable>
        <View style={{ flex: 1 }}><AppText variant="display">WhatsApp</AppText><AppText muted>Historique des messages et de leur livraison.</AppText></View>
      </View>

      {q.isLoading && <ActivityIndicator color={t.brand} />}
      {q.error && <ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger l’historique WhatsApp.'} />}
      {q.isSuccess && !rows.length && <Card><AppText muted>Aucun message WhatsApp pour le moment.</AppText></Card>}

      {rows.map((n: any) => (
        <Card key={n.id} style={{ gap: 8 }}>
          <View style={s.rowBetween}>
            <AppText variant="label" numberOfLines={1}>{TYPE[n.type] ?? n.type}</AppText>
            <View style={[s.tag, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand}>{STATUT[n.statut] ?? n.statut}</AppText></View>
          </View>
          <AppText variant="caption" muted>{new Date(n.createdAt).toLocaleString('fr-FR')}</AppText>
          {Array.isArray(n.events) && n.events.length > 0 && (
            <View style={{ gap: 4 }}>
              {n.events.map((e: any) => (
                <View key={e.id} style={s.rowBetween}>
                  <AppText variant="caption" muted>{new Date(e.createdAt).toLocaleString('fr-FR')}</AppText>
                  <AppText variant="caption">{STATUT[e.status] ?? e.status}</AppText>
                </View>
              ))}
            </View>
          )}
          {n.missionId ? <AppText variant="caption" color={t.brand} onPress={() => router.push({ pathname: '/mission/[id]', params: { id: n.missionId } })}>Voir la mission</AppText> : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
});
