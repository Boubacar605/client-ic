import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../api/client';
import { useMissions } from '../../api/hooks';
import { useReference } from '../../api/reference';
import type { Mission } from '../../api/types';
import { radius } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ErrorBox } from '../../ui/ErrorBox';
import { FilterChips } from '../../ui/FilterChips';
import { MissionCard } from '../../ui/MissionCard';

type Filtre = 'A_POURVOIR' | 'URGENTES' | 'EN_COURS' | 'POURVUES' | 'TERMINEES' | 'FERMEES' | 'BROUILLONS' | 'TOUTES';

const OUVERTES = ['PUBLIEE', 'PARTIELLEMENT_POURVUE'];
const FERMEES = ['CLOTUREE', 'ANNULEE', 'EXPIREE', 'SUSPENDUE'];

const MATCH: Record<Filtre, (m: Mission) => boolean> = {
  A_POURVOIR: (m) => OUVERTES.includes(m.statut),
  URGENTES: (m) => OUVERTES.includes(m.statut) && m.urgente,
  EN_COURS: (m) => m.statut === 'EN_COURS',
  POURVUES: (m) => m.statut === 'POURVUE',
  TERMINEES: (m) => m.statut === 'TERMINEE',
  FERMEES: (m) => FERMEES.includes(m.statut),
  BROUILLONS: (m) => m.statut === 'BROUILLON',
  TOUTES: () => true,
};

const FILTRES: { value: Filtre; label: string }[] = [
  { value: 'A_POURVOIR', label: 'À pourvoir' },
  { value: 'URGENTES', label: 'Urgentes' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'POURVUES', label: 'Pourvues' },
  { value: 'TERMINEES', label: 'Terminées' },
  { value: 'FERMEES', label: 'Fermées' },
  { value: 'BROUILLONS', label: 'Brouillons' },
  { value: 'TOUTES', label: 'Toutes' },
];

// Toutes les annonces du recruteur, filtrables par état : les missions encore à pourvoir passent devant.
export default function MesMissions() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ref = useReference();
  const q = useMissions();
  const [filtre, setFiltre] = useState<Filtre>('A_POURVOIR');
  const [recherche, setRecherche] = useState('');

  const f = recherche.trim().toLowerCase();
  const missions = q.data ?? [];
  const recherchees = useMemo(
    () => missions.filter((m) => `${m.metier} ${m.zone} ${m.lieu ?? ''}`.toLowerCase().includes(f)),
    [missions, f],
  );
  const counts = useMemo(() => {
    const out = {} as Record<Filtre, number>;
    for (const { value } of FILTRES) out[value] = recherchees.filter(MATCH[value]).length;
    return out;
  }, [recherchees]);
  const visible = useMemo(() => {
    const list = recherchees.filter(MATCH[filtre]);
    return [...list].sort((a, b) => {
      if (filtre === 'A_POURVOIR' || filtre === 'URGENTES') {
        if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
        return a.date.localeCompare(b.date);
      }
      return b.date.localeCompare(a.date);
    });
  }, [recherchees, filtre]);

  const open = (id: string) => router.push({ pathname: '/mission/[id]', params: { id } });
  const error = q.error ?? ref.error;
  const refresh = () => { q.refetch(); ref.refetch(); };
  const retour = () => (router.canGoBack() ? router.back() : router.navigate('/recruteur'));

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={refresh} tintColor={t.brand} />}>
      <View style={s.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={10} onPress={retour}
          style={[s.back, { backgroundColor: t.card, borderColor: t.line }]}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="display">Mes missions</AppText>
          <AppText muted>Par défaut, seules les missions à pourvoir s’affichent, les urgentes en tête.</AppText>
        </View>
      </View>

      <View style={[s.search, { backgroundColor: t.card, borderColor: t.line }]}>
        <Ionicons name="search" size={22} color={t.muted} />
        <TextInput accessibilityLabel="Rechercher un métier ou un quartier" placeholder="Rechercher un métier, un quartier…"
          placeholderTextColor={t.muted} value={recherche} onChangeText={setRecherche} style={[s.input, { color: t.text }]} />
      </View>

      <FilterChips options={FILTRES.map((o) => ({ ...o, count: counts[o.value] }))} value={filtre} onChange={setFiltre} />

      {(q.isLoading || ref.isLoading) && <View style={{ padding: 30 }}><ActivityIndicator color={t.brand} /></View>}

      {error && <><ErrorBox message={error instanceof ApiError ? error.title : 'Impossible de charger vos missions.'} />
        <Button label="Réessayer" icon="refresh" variant="secondary" onPress={refresh} /></>}

      {q.isSuccess && visible.length === 0 && (
        <Card>
          <View style={[s.bigIcon, { backgroundColor: t.soft }]}><Ionicons name="briefcase-outline" size={34} color={t.brand} /></View>
          <AppText variant="heading">{f ? 'Aucun résultat' : filtre === 'A_POURVOIR' ? 'Aucune mission à pourvoir' : 'Aucune mission'}</AppText>
          <AppText muted>
            {f ? 'Essayez un autre métier ou quartier.'
              : filtre === 'A_POURVOIR' ? 'Toutes vos annonces sont couvertes. Publiez un nouveau besoin pour continuer.'
              : 'Aucune annonce dans ce statut pour le moment.'}
          </AppText>
          {!f && (filtre === 'A_POURVOIR' || filtre === 'TOUTES') && (
            <Button label="Publier une mission" icon="add" onPress={() => router.navigate('/recruteur/publier')} />
          )}
        </Card>
      )}

      {visible.map((m) => <MissionCard key={m.id} mission={m} onPress={() => open(m.id)} />)}

      {q.isSuccess && visible.length > 0 && (
        <Button label="Publier une mission" icon="add" variant="secondary" onPress={() => router.navigate('/recruteur/publier')} />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 900, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 18, minHeight: 56 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  bigIcon: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
});
