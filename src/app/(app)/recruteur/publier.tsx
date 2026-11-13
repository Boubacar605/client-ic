import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, fieldErrors } from '../../../api/client';
import { createMission } from '../../../api/missions';
import { useReference } from '../../../api/reference';
import { useSession } from '../../../auth/session';
import { isoLocal, MissionForm, validateMission } from '../../../lib/validation';
import { radius } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ChipGroup } from '../../../ui/Chips';
import { ChoiceCard } from '../../../ui/ChoiceCard';
import { DayPicker } from '../../../ui/DayPicker';
import { ErrorBox } from '../../../ui/ErrorBox';
import { HourPicker } from '../../../ui/HourPicker';
import { MetierTile } from '../../../ui/MetierTile';
import { Section } from '../../../ui/Section';
import { Stepper } from '../../../ui/Stepper';
import { TextField } from '../../../ui/TextField';

const demain = () => isoLocal(new Date(Date.now() + 86_400_000));
const blank = (): MissionForm => ({ metierId: null, zoneId: null, nombrePostes: 1, dateMission: demain(), typeHoraire: 'TRAVAIL_JOURNALIER',
  heureDebut: '08:00', heureFin: '12:00', remunerationFcfa: '', urgente: false, description: '' });
const PRESETS = ['5000', '7500', '10000', '15000', '20000'];
const spaced = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Défini hors du composant : sinon il serait recréé à chaque frappe (perte du focus et du défilement).
function Body({ children, scrollRef }: { children: React.ReactNode; scrollRef: React.RefObject<ScrollView | null> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView ref={scrollRef} style={{ backgroundColor: t.bg }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>{children}</ScrollView>
  );
}

// Formulaire de publication : on touche des images et des pastilles, on écrit le moins possible.
export default function Publier() {
  const t = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const { width } = useWindowDimensions();
  const { profil } = useSession();
  const ref = useReference();
  const scroll = useRef<ScrollView>(null);
  const [f, setF] = useState<MissionForm>(blank());
  const [err, setErr] = useState<Record<string, string>>({});
  const [apiErr, setApiErr] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const set = <K extends keyof MissionForm>(k: K, v: MissionForm[K]) => { setF((p) => ({ ...p, [k]: v })); setErr((p) => ({ ...p, [k]: '' })); };
  const tile = Math.min((width - 40 - 12) / 2, 200);
  const top = () => scroll.current?.scrollTo({ y: 0, animated: true });

  async function submit() {
    const e = validateMission(f);
    setErr(e); setApiErr(null);
    if (Object.keys(e).length) return top();
    setLoading(true);
    try {
      const id = await createMission(f, profil!, ref.data!);
      await qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'reference' });
      setDoneId(id);
    } catch (x) { setApiErr(x as ApiError); setErr(fieldErrors(x)); top(); }
    finally { setLoading(false); }
  }

  if (doneId) {
    return (
      <Body scrollRef={scroll}>
        <Card>
          <View style={[s.bigIcon, { backgroundColor: t.soft }]}><Ionicons name="checkmark-circle" size={48} color={t.brand} /></View>
          <AppText variant="title">Mission publiée !</AppText>
          <AppText muted>Les travailleurs adaptés vont être prévenus. Vous verrez les candidats arriver dans votre mission.</AppText>
          <Button label="Voir ma mission" icon="arrow-forward" large onPress={() => router.push({ pathname: '/mission/[id]', params: { id: doneId } })} />
          <Button label="Publier une autre mission" variant="secondary" onPress={() => { setF(blank()); setDoneId(null); }} />
        </Card>
      </Body>
    );
  }

  if (ref.isLoading) return <Body scrollRef={scroll}><ActivityIndicator color={t.brand} style={{ marginTop: 60 }} /></Body>;
  if (ref.isError || !ref.data) {
    return <Body scrollRef={scroll}><ErrorBox message={ref.error instanceof ApiError ? ref.error.title : 'Impossible de charger les métiers et les zones.'} /><Button label="Réessayer" icon="refresh" onPress={() => ref.refetch()} /></Body>;
  }

  const { metiers, zones } = ref.data;
  const summary = Object.values(err).filter(Boolean).length;

  return (
    <Body scrollRef={scroll}>
      <View style={{ gap: 6 }}>
        <AppText variant="display">Publier une mission</AppText>
        <AppText muted>Touchez, choisissez, publiez : deux minutes.</AppText>
      </View>

      {apiErr && <ErrorBox message={apiErr.title} code={apiErr.code} />}
      {summary > 0 && !apiErr && <ErrorBox message="Corrigez les éléments en rouge pour continuer." />}

      <Section n={1} title="Quel travail ?" hint="Touchez l’image du métier." error={err.metierId}>
        <View style={s.grid}>{metiers.map((m) => <MetierTile key={m.id} metier={m.libelle} width={tile} selected={f.metierId === m.id} onPress={() => set('metierId', m.id)} />)}</View>
      </Section>

      <Section n={2} title="Où ?" hint="Le quartier de la mission." error={err.zoneId}>
        <ChipGroup value={f.zoneId} onChange={(v) => set('zoneId', v)} options={zones.map((z) => ({ value: z.id, label: z.nom }))} />
      </Section>

      <Section n={3} title="Combien de personnes ?" error={err.nombrePostes}>
        <Stepper value={f.nombrePostes} onChange={(n) => set('nombrePostes', n)} />
      </Section>

      <Section n={4} title="Quel jour ?" error={err.dateMission}>
        <DayPicker value={f.dateMission} onChange={(d) => set('dateMission', d)} />
      </Section>

      <Section n={5} title="Quelle durée ?" hint="Pas besoin d’heure pour une journée." error={err.typeHoraire || err.heureFin || err.heureDebut}>
        <ChoiceCard icon="sunny" title="Toute la journée" subtitle="Journée de travail" selected={f.typeHoraire === 'TRAVAIL_JOURNALIER'} onPress={() => set('typeHoraire', 'TRAVAIL_JOURNALIER')} />
        <ChoiceCard icon="partly-sunny-outline" title="Une demi-journée" subtitle="Matin ou après-midi" selected={f.typeHoraire === 'DEMI_JOURNEE'} onPress={() => set('typeHoraire', 'DEMI_JOURNEE')} />
        <ChoiceCard icon="time-outline" title="Des heures précises" subtitle="Je choisis le début et la fin" selected={f.typeHoraire === 'CRENEAU_PRECIS'} onPress={() => set('typeHoraire', 'CRENEAU_PRECIS')} />
        {f.typeHoraire === 'CRENEAU_PRECIS' && (
          <View style={{ gap: 12 }}>
            <HourPicker label="Début" value={f.heureDebut} onChange={(h) => set('heureDebut', h)} />
            <HourPicker label="Fin" value={f.heureFin} onChange={(h) => set('heureFin', h)} />
          </View>
        )}
      </Section>

      <Section n={6} title="Combien payez-vous ?" hint="Par personne, en FCFA. Le paiement se fait directement avec le travailleur." error={err.remunerationFcfa}>
        <ChipGroup value={PRESETS.includes(f.remunerationFcfa.replace(/\s/g, '')) ? f.remunerationFcfa.replace(/\s/g, '') : null}
          onChange={(v) => set('remunerationFcfa', v)} options={PRESETS.map((p) => ({ value: p, label: spaced(p) }))} />
        <TextField label="Autre montant" icon="cash-outline" keyboardType="number-pad" placeholder="12 000" value={spaced(f.remunerationFcfa.replace(/\s/g, ''))}
          onChangeText={(v) => set('remunerationFcfa', v.replace(/\D/g, ''))} error={null} />
      </Section>

      <Section n={7} title="C’est urgent ?">
        <Card>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="label">Mission urgente</AppText>
              <AppText variant="caption" muted>Le premier travailleur qui répond est confirmé.</AppText>
            </View>
            <Switch value={f.urgente} onValueChange={(v) => set('urgente', v)} trackColor={{ true: t.brand }} />
          </View>
        </Card>
      </Section>

      <Section n={8} title="Un détail à ajouter ?" hint="Facultatif." error={err.description}>
        <View style={[s.note, { backgroundColor: t.card, borderColor: t.line }]}>
          <TextInput accessibilityLabel="Détail de la mission" multiline placeholder="Ex. matériel fourni, étage, accès…" placeholderTextColor={t.muted}
            value={f.description} onChangeText={(v) => set('description', v)} style={{ color: t.text, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }} maxLength={1000} />
        </View>
      </Section>

      <Button label="Publier la mission" icon="paper-plane" large loading={loading} onPress={submit} />
    </Body>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  note: { borderWidth: 1.5, borderRadius: radius.lg, padding: 14 },
  bigIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
});
