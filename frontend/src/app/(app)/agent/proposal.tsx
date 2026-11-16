import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useAgentWorkers } from '../../../api/hooks';
import { createAgentProposal } from '../../../api/roles';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';
export default function AgentProposal() {
  const workers = useAgentWorkers(); const [travailleurId, setWorker] = useState(''); const [missionId, setMission] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [done, setDone] = useState(false);
  const submit = async () => { setError(null); setDone(false); setLoading(true); try { await createAgentProposal({ travailleurId: travailleurId.trim(), missionId: missionId.trim() }); setDone(true); } catch (e) { setError(e instanceof Error ? e.message : 'Impossible de créer la proposition.'); } finally { setLoading(false); } };
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}><AppText variant="display">Proposer une mission</AppText><Card><TextField label="Identifiant travailleur" value={travailleurId} onChangeText={setWorker} placeholder="UUID du travailleur" /><TextField label="Identifiant mission" value={missionId} onChangeText={setMission} placeholder="UUID de la mission" /><AppText muted>{workers.data?.total ? `${workers.data.total} travailleurs disponibles dans votre portefeuille.` : ''}</AppText>{error ? <ErrorBox message={error} /> : null}{done ? <AppText color="#16805b">Proposition envoyée.</AppText> : null}<Button label="Envoyer la proposition" loading={loading} disabled={!travailleurId || !missionId} icon="send-outline" onPress={submit} /></Card></ScrollView>;
}
