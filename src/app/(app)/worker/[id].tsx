import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../../api/client';
import { usePublicWorker } from '../../../api/hooks';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { MetierThumb } from '../../../ui/MetierThumb';

// Fiche publique d'un travailleur (agent, recruteur, admin) : métiers, zones et fiabilité.
export default function WorkerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = usePublicWorker(id);
  const w = q.data;
  const initiales = (w?.nom ?? '?').split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[s.top, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={24} color={t.text} /></Pressable>
        <AppText variant="heading" numberOfLines={1} style={{ flex: 1 }}>{w?.nom ?? 'Travailleur'}</AppText>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
        {q.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 40 }} />}
        {q.isError && <><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger ce profil.'} /><Button label="Réessayer" icon="refresh" onPress={() => q.refetch()} /></>}

        {w && (
          <>
            <Card>
              <View style={s.identity}>
                {w.photoUrl
                  ? <Image source={{ uri: w.photoUrl }} style={s.avatar} resizeMode="cover" />
                  : <View style={[s.avatar, s.avatarFallback, { backgroundColor: t.soft }]}><AppText variant="title" color={t.brand}>{initiales || '?'}</AppText></View>}
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="title" numberOfLines={2}>{w.nom}</AppText>
                  <View style={s.score}><Ionicons name="shield-checkmark-outline" size={18} color={t.brand} />
                    <AppText color={t.brand} style={{ fontWeight: '800' }}>{typeof w.scoreFiabilite === 'number' ? `${Math.round(w.scoreFiabilite)} %` : '—'}</AppText>
                    <AppText muted>fiabilité</AppText>
                  </View>
                </View>
              </View>
            </Card>

            <Card>
              <AppText variant="heading">Métiers</AppText>
              {w.metiers?.length
                ? w.metiers.map((m: { id: string; libelle: string; categorie?: string; experienceAnnees?: number }) => (
                  <View key={m.id} style={s.metier}>
                    <MetierThumb metier={m.libelle} size={48} radius={14} />
                    <View style={{ flex: 1 }}>
                      <AppText style={{ fontWeight: '700' }}>{m.libelle}</AppText>
                      <AppText muted variant="caption">{m.categorie ?? 'Métier'}{typeof m.experienceAnnees === 'number' ? ` · ${m.experienceAnnees} an${m.experienceAnnees > 1 ? 's' : ''} d’expérience` : ''}</AppText>
                    </View>
                  </View>
                ))
                : <AppText muted>Aucun métier renseigné.</AppText>}
            </Card>

            <Card>
              <AppText variant="heading">Zones d’intervention</AppText>
              {w.zones?.length
                ? <View style={s.chips}>{w.zones.map((z: { id: string; nom: string; niveau?: string }) => (
                  <View key={z.id} style={[s.chip, { backgroundColor: t.soft }]}>
                    <Ionicons name="location-outline" size={14} color={t.brand} />
                    <AppText variant="caption" color={t.brand} style={{ fontWeight: '700' }}>{z.nom}</AppText>
                  </View>
                ))}</View>
                : <AppText muted>Aucune zone renseignée.</AppText>}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  body: { padding: 20, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  score: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metier: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
});
