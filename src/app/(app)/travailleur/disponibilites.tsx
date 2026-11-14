import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDisponibilite, getDisponibilite, removeDisponibilite, updateDisponibilite } from '../../../api/disponibilites';
import type { Periode } from '../../../api/disponibilites';
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
import { TextField } from '../../../ui/TextField';

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
  const [detail, setDetail] = useState<{ id: string; date: string; heureDebut: string; heureFin: string } | null>(null);
  const [detailBusy, setDetailBusy] = useState<string | null>(null);

  async function choisir(date: string, v: Choix) {
    const existantes = list.filter((x) => x.date === date);
    if (v !== 'AUCUNE' && existantes.some((x) => x.periode === v)) {
      await ouvrirDetail(date, existantes.find((x) => x.periode === v)!.id);
      return; // déjà choisi : on ouvre le détail (horaires)
    }
    await act.run(date, async () => {
      if (v === 'AUCUNE') { for (const e of existantes) await removeDisponibilite(e.id); return; }
      const [premiere, ...reste] = existantes;
      if (premiere) {
        await updateDisponibilite(premiere.id, { dateDisponibilite: date, periode: v });
        for (const e of reste) await removeDisponibilite(e.id);
      } else {
        await addDisponibilite(date, v, profil!);
      }
    });
  }

  async function ouvrirDetail(date: string, id: string) {
    if (detail?.id === id) { setDetail(null); return; } // replier
    setDetailBusy(date);
    try {
      const d = await getDisponibilite(id);
      setDetail({ id, date, heureDebut: d.heureDebut ?? '', heureFin: d.heureFin ?? '' });
    } catch { /* le détail n'est pas indispensable */ }
    finally { setDetailBusy(null); }
  }

  async function enregistrerHoraires() {
    if (!detail) return;
    await act.run(detail.date, () => updateDisponibilite(detail.id, {
      heureDebut: detail.heureDebut.trim() || null,
      heureFin: detail.heureFin.trim() || null,
    }));
    setDetail(null);
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
            {detailBusy === date && <ActivityIndicator color={t.brand} />}
            {detail?.date === date && (
              <View style={[s.horaires, { borderTopColor: t.line }]}>
                <AppText variant="label">Préciser les horaires (facultatif)</AppText>
                <View style={s.opts}>
                  <View style={{ flex: 1 }}><TextField label="Début" value={detail.heureDebut} onChangeText={(v) => setDetail((d) => (d ? { ...d, heureDebut: v } : d))} placeholder="08:00" /></View>
                  <View style={{ flex: 1 }}><TextField label="Fin" value={detail.heureFin} onChangeText={(v) => setDetail((d) => (d ? { ...d, heureFin: v } : d))} placeholder="16:00" /></View>
                </View>
                <Button label="Enregistrer les horaires" icon="time-outline" loading={act.busy === date} onPress={enregistrerHoraires} />
              </View>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  note: { padding: 12, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  opts: { flexDirection: 'row', gap: 8 },
  opt: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1.5 },
  horaires: { gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
});
