import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAdminUser, updateUserPremium, updateUserStatus } from '../../../../api/admin';
import { ApiError } from '../../../../api/client';
import { useSession } from '../../../../auth/session';
import { ROLE_LABEL, STATUT_COMPTE } from '../../../../lib/format';
import { useTheme } from '../../../../theme/useTheme';
import { AppText } from '../../../../ui/AppText';
import { Button } from '../../../../ui/Button';
import { Card } from '../../../../ui/Card';
import { ErrorBox } from '../../../../ui/ErrorBox';

export default function AdminUserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { profil } = useSession();
  const q = useQuery({ queryKey: ['admin-user', id], enabled: !!id, queryFn: () => getAdminUser(id!) });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['admin-user', id] }); qc.invalidateQueries({ queryKey: ['admin-users'] }); };
  const status = useMutation({ mutationFn: (value: string) => updateUserStatus(id!, value), onSuccess: invalidate });
  const premium = useMutation({ mutationFn: (value: boolean) => updateUserPremium(id!, value), onSuccess: invalidate });
  const u = q.data;
  const error = q.error ?? status.error ?? premium.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/admin/users'))}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}><Ionicons name="arrow-back" size={22} color={t.text} /></Pressable>
        <View style={{ flex: 1 }}><AppText variant="heading">Compte</AppText><AppText muted numberOfLines={1}>{id}</AppText></View>
      </View>

      {q.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger le compte.'} />}

      {u && (
        <>
          <Card>
            <View style={s.row}><Ionicons name="person-circle-outline" size={26} color={t.brand} /><AppText variant="title" numberOfLines={1}>{u.nom}</AppText></View>
            <AppText muted>Rôle : {ROLE_LABEL[u.role] ?? u.role}</AppText>
            <AppText muted>Statut : {STATUT_COMPTE[u.statut] ?? u.statut}</AppText>
            {u.telephone ? <AppText muted>Téléphone : {u.telephone}</AppText> : null}
            <AppText muted>Premium : {u.isPremium ? 'oui' : 'non'}</AppText>
          </Card>

          <Card>
            <AppText variant="heading">Modération</AppText>
            {u.id === profil?.id
              ? <AppText muted>Vous ne pouvez pas désactiver votre propre compte.</AppText>
              : u.statut === 'ACTIF'
                ? <Button label="Suspendre le compte" icon="pause-circle-outline" variant="secondary" loading={status.isPending} onPress={() => status.mutate('SUSPENDU')} />
                : <Button label="Réactiver le compte" icon="play-circle-outline" loading={status.isPending} onPress={() => status.mutate('ACTIF')} />}
            <Button label={u.isPremium ? 'Retirer le premium' : 'Activer le premium'} icon="star-outline" variant="secondary" loading={premium.isPending} onPress={() => premium.mutate(!u.isPremium)} />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
