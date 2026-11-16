import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDisponibilite, Periode, removeDisponibilite } from '../../../api/disponibilites';
import { ApiError } from '../../../api/client';
import { useDisponibilites } from '../../../api/hooks';
import { useSession } from '../../../auth/session';
import { fdate } from '../../../lib/format';
import { useAct } from '../../../lib/useAct';
import { isoLocal } from '../../../lib/validation';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';

type Choix = Periode | 'AUCUNE';
const OPTIONS: { v: Choix; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { v: 'JOURNEE', label: 'Journée', icon: 'sunny' },
  { v: 'MATIN', label: 'Matin', icon: 'partly-sunny' },
  { v: 'APRES_MIDI', label: 'Après-midi', icon: 'moon' },
  { v: 'AUCUNE', label: 'Pas libre', icon: 'close-circle' },
];

// Les 7 prochains jours : on touche une pastille par jour. Être disponible n'engage personne.
export default function Disponibilites() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { profil } = useSession();
  const q = useDisponibilites();
  const act = useAct();
  const list = q.data ?? [];
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return isoLocal(d); });

  async function choisir(date: string, v: Choix) {
    const existantes = list.filter((x) => x.date === date);
    if (v !== 'AUCUNE' && existantes.some((x) => x.periode === v)) return; // déjà choisi
    await act.run(`${date}`, async () => {
      for (const e of existantes) await removeDisponibilite(e.id);
      if (v !== 'AUCUNE') await addDisponibilite(date, v, profil!);
    });
  }

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={t.brand} />}>
      <View style={{ gap: 6 }}>
        <AppText variant="display">Mes disponibilités</AppText>
        <AppText muted>Dites quand vous êtes libre : vous recevrez les bonnes missions.</AppText>
      </View>
      <View style={[s.note, { backgroundColor: t.sunSoft }]}><AppText variant="caption">Être disponible n’engage personne : seule votre confirmation compte.</AppText></View>
      {act.error && <ErrorBox message={act.error.title} code={act.error.code} />}
      {q.isLoading && <ActivityIndicator color={t.brand} style={{ marginTop: 30 }} />}
      {q.isError && <><ErrorBox message={q.error instanceof ApiError ? q.error.title : 'Impossible de charger vos disponibilités.'} /><Button label="Réessayer" icon="refresh" onPress={() => q.refetch()} /></>}
      {!q.isLoading && !q.isError && days.map((date, i) => {
        const courant = list.find((x) => x.date === date)?.periode ?? 'AUCUNE';
        const busy = act.busy === date;
        return (
          <Card key={date}>
            <View style={s.row}>
              <AppText variant="heading">{i === 0 ? 'Aujourd’hui' : fdate(date)}</AppText>
              {busy && <ActivityIndicator color={t.brand} />}
            </View>
            <View style={s.opts}>
              {OPTIONS.map((o) => {
                const on = courant === o.v;
                return (
                  <Pressable key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${fdate(date)}, ${o.label}`}
                    disabled={busy} onPress={() => choisir(date, o.v)}
                    style={[s.opt, { backgroundColor: on ? (o.v === 'AUCUNE' ? t.muted : t.brand) : t.bg, borderColor: on ? 'transparent' : t.line }]}>
                    <Ionicons name={o.icon} size={22} color={on ? t.onBrand : t.muted} />
                    <AppText variant="caption" color={on ? t.onBrand : t.text} style={{ fontWeight: '700' }}>{o.label}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14 },
  note: { padding: 12, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  opts: { flexDirection: 'row', gap: 8 },
  opt: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1.5 },
});
