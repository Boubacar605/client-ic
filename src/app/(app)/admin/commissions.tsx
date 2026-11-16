import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommissionStats, listCommissionPayments, listCommissions, recordCommissionPayment, sendCommissionReminder } from '../../../api/admin';
import { ApiError } from '../../../api/client';
import { fcfa } from '../../../lib/format';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { StatGrid, StatItem } from '../../../ui/StatGrid';
import { TextField } from '../../../ui/TextField';

const STATUS: Record<string, string> = { DUE: 'Due', PARTIALLY_PAID: 'Partiellement payée', PAID: 'Payée' };

export default function AdminCommissions() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [historyId, setHistoryId] = useState<string | null>(null);

  const stats = useQuery({ queryKey: ['admin-commission-stats'], queryFn: getCommissionStats });
  const query = useQuery({ queryKey: ['admin-commissions', page], queryFn: () => listCommissions({ page, limit: 20 }) });
  const history = useQuery({ queryKey: ['admin-commission-payments', historyId], enabled: !!historyId, queryFn: () => listCommissionPayments(historyId!) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-commissions'] });
    qc.invalidateQueries({ queryKey: ['admin-commission-stats'] });
    qc.invalidateQueries({ queryKey: ['admin-commission-payments'] });
  };
  const pay = useMutation({
    mutationFn: ({ id, montant }: { id: string; montant: number }) => recordCommissionPayment(id, { montant }),
    onSuccess: () => { setOpenId(null); setAmount(''); invalidate(); },
  });
  const remind = useMutation({ mutationFn: sendCommissionReminder });

  const s0 = stats.data ?? {};
  const items: StatItem[] = [
    { key: 'generated', label: 'Commissions générées', value: typeof s0.generated === 'number' ? fcfa(s0.generated) : undefined, icon: 'trending-up-outline' },
    { key: 'paid', label: 'Encaissées', value: typeof s0.paid === 'number' ? fcfa(s0.paid) : undefined, icon: 'checkmark-done-outline' },
    { key: 'outstanding', label: 'Restant dû', value: typeof s0.outstanding === 'number' ? fcfa(s0.outstanding) : undefined, icon: 'alert-circle-outline', accent: 'amber' },
    { key: 'entries', label: 'Lignes de commission', value: s0.entries, icon: 'list-outline' },
  ];
  const rows = query.data?.data ?? [];
  const error = query.error ?? stats.error ?? pay.error ?? remind.error;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => { query.refetch(); stats.refetch(); }} tintColor={t.brand} />}>
      <View style={s.head}><View style={{ flex: 1 }}><AppText variant="display">Commissions</AppText><AppText muted>{query.data?.total ?? 0} ligne(s)</AppText></View></View>

      <StatGrid items={items} />
      {query.isLoading && <ActivityIndicator color={t.brand} />}
      {error && <ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger les commissions.'} />}
      {query.isSuccess && !rows.length && <Card><AppText muted>Aucune commission générée pour le moment.</AppText></Card>}

      {rows.map((c: any) => (
        <Card key={c.id} style={{ gap: 10 }}>
          <View style={s.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading" numberOfLines={1}>{c.workerName}</AppText>
              <AppText variant="caption" muted>Brut {fcfa(c.grossAmount)} · Net {fcfa(c.netAmount)}</AppText>
            </View>
            <View style={[s.status, { backgroundColor: t.soft }]}><AppText variant="caption" color={t.brand}>{STATUS[c.status] ?? c.status}</AppText></View>
          </View>
          <AppText variant="label" color={t.amber}>Commission : {fcfa(c.commissionAmount)} · Payé : {fcfa(c.paidAmount)} · Reste : {fcfa(c.remainingCommission)}</AppText>

          <View style={s.actions}>
            {c.remainingCommission > 0 && (
              <View style={{ flex: 1 }}>
                <Button label={openId === c.id ? 'Annuler' : 'Encaisser'} icon="cash-outline" onPress={() => { setOpenId(openId === c.id ? null : c.id); setAmount(''); }} />
              </View>
            )}
            <View style={{ flex: 1 }}><Button label="Relancer" icon="notifications-outline" variant="secondary" loading={remind.isPending} onPress={() => remind.mutate(c.id)} /></View>
          </View>

          {openId === c.id && (
            <View style={{ gap: 8 }}>
              <TextField label="Montant encaissé (FCFA)" placeholder="Ex. 5000" keyboardType="number-pad" value={amount} onChangeText={(v) => setAmount(v.replace(/\D/g, ''))} />
              <Button label="Enregistrer le paiement" icon="checkmark" loading={pay.isPending} disabled={!amount}
                onPress={() => pay.mutate({ id: c.id, montant: Number(amount) })} />
            </View>
          )}

          <Button label={historyId === c.id ? 'Masquer l’historique' : 'Historique des paiements'} variant="ghost" icon="time-outline"
            onPress={() => setHistoryId(historyId === c.id ? null : c.id)} />
          {historyId === c.id && (
            <View style={{ gap: 6 }}>
              {history.isLoading && <ActivityIndicator color={t.brand} />}
              {history.error && <ErrorBox message="Impossible de charger l’historique." />}
              {history.data?.payments?.length
                ? history.data.payments.map((p: any) => (
                    <View key={p.id} style={s.rowBetween}>
                      <AppText variant="caption" muted>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</AppText>
                      <AppText variant="caption">{fcfa(p.montant)}{p.methode ? ` · ${p.methode}` : ''}</AppText>
                    </View>
                  ))
                : !history.isLoading && <AppText variant="caption" muted>Aucun paiement enregistré.</AppText>}
            </View>
          )}
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  status: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
});
