import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listAdminUsers, updateUserPremium, updateUserStatus } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { useSession } from '../../../auth/session';
import { ROLE_LABEL, STATUT_COMPTE } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';

const ROLES = ['', 'TRAVAILLEUR', 'RECRUTEUR', 'AGENT', 'ADMINISTRATEUR'];
const STATUTS = ['', 'ACTIF', 'SUSPENDU', 'SUPPRIME'];

export default function AdminUsers() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { profil } = useSession();
  const [role, setRole] = useState('');
  const [statut, setStatut] = useState('');
  const [nom, setNom] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['admin-users', role, statut, nom, page],
    queryFn: () => listAdminUsers({ role: role || undefined, statut: statut || undefined, nom: nom.trim() || undefined, page, limit: 20 }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] });
  const status = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => updateUserStatus(id, value),
    onSuccess: invalidate,
  });
  const premium = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => updateUserPremium(id, value),
    onSuccess: invalidate,
  });
  const rows = query.data?.data ?? [];
  const error = query.error ?? status.error ?? premium.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={t.brand} />}>
      <View style={s.head}>
        <View style={{ flex: 1 }}><AppText variant="display">Comptes</AppText><AppText muted>{query.data?.total ?? 0} compte(s)</AppText></View>
        <Button label="Créer" icon="person-add-outline" onPress={() => router.navigate('/admin/nouveau-compte')} />
      </View>

      <TextField label="Rechercher par nom" icon="search-outline" placeholder="Ex. Awa Ndiaye" value={nom} onChangeText={(v) => { setNom(v); setPage(1); }} autoCapitalize="none" />
      <View style={s.filters}>
        {ROLES.map((r) => (
          <Pressable key={r || 'tous'} accessibilityRole="button" onPress={() => { setRole(r); setPage(1); }}
            style={[s.chip, { borderColor: role === r ? t.brand : t.line, backgroundColor: role === r ? t.soft : t.card }]}>
            <AppText variant="caption" color={role === r ? t.brand : t.muted}>{r ? ROLE_LABEL[r] ?? r : 'Tous'}</AppText>
          </Pressable>
        ))}
      </View>
      <View style={s.filters}>
        {STATUTS.map((st) => (
          <Pressable key={st || 'tous'} accessibilityRole="button" onPress={() => { setStatut(st); setPage(1); }}
            style={[s.chip, { borderColor: statut === st ? t.brand : t.line, backgroundColor: statut === st ? t.soft : t.card }]}>
            <AppText variant="caption" color={statut === st ? t.brand : t.muted}>{st ? STATUT_COMPTE[st] ?? st : 'Tous les statuts'}</AppText>
          </Pressable>
        ))}
      </View>

      {query.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les comptes.'} />}
      {query.isSuccess && !rows.length && <Card><AppText muted>Aucun compte ne correspond à ces filtres.</AppText></Card>}

      {rows.map((u: any) => (
        <Card key={u.id} style={{ gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/admin/user/[id]', params: { id: u.id } })} style={s.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" numberOfLines={1}>{u.nom}</AppText>
              <AppText variant="caption" muted>{ROLE_LABEL[u.role] ?? u.role} · {STATUT_COMPTE[u.statut] ?? u.statut}{u.telephone ? ` · ${u.telephone}` : ''}</AppText>
            </View>
            {u.isPremium ? <Ionicons name="star" size={18} color={t.amber} /> : null}
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Pressable>
          <View style={s.actions}>
            {u.id === profil?.id
              ? <View style={{ flex: 1 }}><Button label="Votre compte" variant="ghost" disabled onPress={() => undefined} /></View>
              : u.statut === 'ACTIF'
                ? <View style={{ flex: 1 }}><Button label="Suspendre" variant="secondary" loading={status.isPending} onPress={() => status.mutate({ id: u.id, value: 'SUSPENDU' })} /></View>
                : <View style={{ flex: 1 }}><Button label="Réactiver" loading={status.isPending} onPress={() => status.mutate({ id: u.id, value: 'ACTIF' })} /></View>}
            <View style={{ flex: 1 }}><Button label={u.isPremium ? 'Retirer premium' : 'Passer premium'} icon="star-outline" variant="secondary" loading={premium.isPending} onPress={() => premium.mutate({ id: u.id, value: !u.isPremium })} /></View>
          </View>
        </Card>
      ))}

      {(query.data?.totalPages ?? 0) > 1 && (
        <View style={s.actions}>
          <View style={{ flex: 1 }}><Button label="Précédent" variant="secondary" disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} /></View>
          <AppText variant="caption" muted>Page {page} / {query.data?.totalPages}</AppText>
          <View style={{ flex: 1 }}><Button label="Suivant" variant="secondary" disabled={page >= (query.data?.totalPages ?? 1)} onPress={() => setPage((p) => p + 1)} /></View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 12, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
