import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAdminSettings, listRestrictedWorkers, patchAdminSettings } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { getPublicSettings } from '../../../api/reference';
import { fcfa } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';

export default function AdminSettings() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: getAdminSettings });
  const publicSettings = useQuery({ queryKey: ['public-settings'], queryFn: getPublicSettings });
  const restricted = useQuery({ queryKey: ['admin-restricted-workers'], queryFn: () => listRestrictedWorkers() });
  const [percent, setPercent] = useState('');
  const [maxDebt, setMaxDebt] = useState('');
  useEffect(() => {
    if (settings.data) {
      setPercent(String(settings.data.commissionPercent ?? 0));
      setMaxDebt(String(settings.data.maxCommissionDebt ?? 0));
    }
  }, [settings.data]);
  const save = useMutation({
    mutationFn: () => patchAdminSettings({ commissionPercent: Number(percent), maxCommissionDebt: Number(maxDebt) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
  const error = settings.error ?? save.error ?? restricted.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <View style={s.head}><View style={{ flex: 1 }}><AppText variant="display">Réglages</AppText><AppText muted>Paramètres de la plateforme.</AppText></View></View>

      {settings.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les réglages.'} />}

      {settings.data && (
        <Card>
          <View style={s.row}><Ionicons name="percent-outline" size={22} color={t.brand} /><AppText variant="heading">Commission</AppText></View>
          <TextField label="Pourcentage de commission" placeholder="Ex. 10" keyboardType="numeric" value={percent} onChangeText={(v) => setPercent(v.replace(/[^0-9.]/g, ''))} hint="Entre 0 et 100 %" />
          <TextField label="Dette maximale autorisée (FCFA)" placeholder="Ex. 50000" keyboardType="number-pad" value={maxDebt} onChangeText={(v) => setMaxDebt(v.replace(/\D/g, ''))} />
          <Button label="Enregistrer les réglages" icon="checkmark" loading={save.isPending} onPress={() => save.mutate()} />
          {save.isSuccess ? <AppText color={t.brand} style={{ fontWeight: '700' }}>Réglages enregistrés.</AppText> : null}
        </Card>
      )}

      <Card>
        <View style={s.row}><Ionicons name="eye-outline" size={22} color={t.brand} /><AppText variant="heading">Paramètres publics</AppText></View>
        <AppText muted>Valeurs exposées aux applications mobiles (lecture seule).</AppText>
        {publicSettings.isLoading && <ActivityIndicator color={t.brand} />}
        {publicSettings.data
          ? Object.entries(publicSettings.data).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v)).map(([k, v]) => (
            <View key={k} style={s.rowBetween}>
              <AppText variant="caption" muted>{k}</AppText>
              <AppText variant="label">{String(v)}</AppText>
            </View>
          ))
          : !publicSettings.isLoading && <AppText muted>Aucun paramètre public.</AppText>}
      </Card>

      <Card>
        <View style={s.row}><Ionicons name="albums-outline" size={22} color={t.brand} /><AppText variant="heading">Référentiels</AppText></View>
        <AppText muted>Métiers et zones utilisés dans les formulaires de mission.</AppText>
        <Button label="Gérer les métiers et zones" icon="chevron-forward" variant="secondary" onPress={() => router.navigate('/admin/referentiels')} />
      </Card>

      <Card>
        <View style={s.row}><Ionicons name="lock-closed-outline" size={22} color={t.amber} /><AppText variant="heading">Travailleurs restreints</AppText></View>
        <AppText muted>Dette supérieure au seuil de {fcfa(Number(maxDebt || settings.data?.maxCommissionDebt || 0))}.</AppText>
        {restricted.isLoading && <ActivityIndicator color={t.brand} />}
        {restricted.data?.data?.length
          ? restricted.data.data.map((w: any) => (
              <View key={w.workerId} style={s.rowBetween}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" numberOfLines={1}>{w.nom}</AppText>
                  <AppText variant="caption" muted>{w.telephone ?? 'Téléphone non renseigné'}</AppText>
                </View>
                <AppText variant="caption" color={t.amber}>{fcfa(w.remainingCommission)}</AppText>
              </View>
            ))
          : !restricted.isLoading && <AppText muted>Aucun travailleur restreint.</AppText>}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
});
