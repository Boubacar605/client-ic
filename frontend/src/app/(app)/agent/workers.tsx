import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useAgentWorkers } from '../../../api/hooks';
import { AppText } from '../../../ui/AppText';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
export default function AgentWorkers() {
  const q = useAgentWorkers(); return <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}><AppText variant="display">Mes travailleurs</AppText>{q.isLoading ? <ActivityIndicator /> : q.error ? <ErrorBox message="Impossible de charger les travailleurs." /> : q.data?.data.length ? q.data.data.map((w) => <Card key={w.id}><AppText variant="heading">{w.nom}</AppText><AppText muted>{w.metiers.map((m) => m.libelle).join(', ') || 'Métier non renseigné'}</AppText><AppText muted>{w.zones.map((z) => z.nom).join(', ')}</AppText><AppText>Fiabilité : {w.scoreFiabilite ?? '—'} % · {w.applicationsCount} candidature(s)</AppText></Card>) : <Card><AppText>Aucun travailleur géré.</AppText></Card>}</ScrollView>;
}
