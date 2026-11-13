import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ApiError } from '../../api/client';
import { useNotificationActions, useNotifications, useUnreadCount } from '../../api/hooks';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ErrorBox } from '../../ui/ErrorBox';

export default function Notifications() {
  const t = useTheme(); const router = useRouter(); const q = useNotifications(); const count = useUnreadCount(); const actions = useNotificationActions();
  return <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.body} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} />}>
    <View style={s.head}><AppText variant="display">Notifications</AppText>{(count.data?.count ?? 0) > 0 ? <View style={[s.badge, { backgroundColor: t.brand }]}><AppText color={t.onBrand}>{count.data!.count}</AppText></View> : null}</View>
    <Button label="Tout marquer comme lu" variant="secondary" icon="checkmark-done-outline" disabled={!count.data?.count} loading={actions.readAll.isPending} onPress={() => actions.readAll.mutate()} />
    {q.isLoading ? <ActivityIndicator color={t.brand} /> : q.error ? <ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger les notifications.'} /> : (q.data?.data?.length ?? 0) === 0 ? <Card><AppText variant="heading">Aucune notification</AppText><AppText muted>Vous êtes à jour.</AppText></Card> : q.data?.data?.map((n) => <Pressable key={n.id} onPress={() => router.push({ pathname: '/notification/[id]', params: { id: n.id } })}><Card><View style={s.row}><Ionicons name={n.lu ? 'mail-open-outline' : 'mail-unread-outline'} size={24} color={n.lu ? t.muted : t.brand} /><View style={{ flex: 1 }}><AppText variant="label">{n.type.replaceAll('_', ' ')}</AppText><AppText muted>{new Date(n.createdAt).toLocaleString('fr-FR')}</AppText></View>{!n.lu ? <View style={[s.dot, { backgroundColor: t.brand }]} /> : null}</View></Card></Pressable>)}
  </ScrollView>;
}
const s = StyleSheet.create({ body: { padding: 20, gap: 14, paddingBottom: 120 }, head: { flexDirection: 'row', alignItems: 'center', gap: 10 }, badge: { borderRadius: 99, minWidth: 28, padding: 5, alignItems: 'center' }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, dot: { width: 9, height: 9, borderRadius: 5 } });
