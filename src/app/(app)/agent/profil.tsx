import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAgentProfile, useAgentProfileMutation } from '../../../api/hooks';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';
import { ProfilePhotoCard } from '../../../ui/ProfilePhotoCard';
export default function AgentProfile() {
  const q = useAgentProfile(); const mutation = useAgentProfileMutation(); const [perimetre, setPerimetre] = useState('');
  useEffect(() => { if (q.data) setPerimetre(q.data.perimetre ?? ''); }, [q.data]);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}><AppText variant="display">Profil agent</AppText>{q.data ? <ProfilePhotoCard photoUrl={q.data.photoUrl} queryKeys={[['agent-profile'], ['bootstrap']]} /> : null}<Card>{q.data ? <><AppText variant="heading">{q.data.nom}</AppText><AppText muted>{q.data.telephone ?? 'Téléphone non renseigné'} · {q.data.workersManaged} travailleurs</AppText><TextField label="Périmètre" value={perimetre} onChangeText={setPerimetre} multiline hint="Zone de couverture de l’agent" />{mutation.error ? <ErrorBox message="Impossible d’enregistrer le profil." /> : null}<Button label="Enregistrer" loading={mutation.isPending} onPress={() => mutation.mutate({ perimetre })} /></> : <AppText muted>Chargement…</AppText>}</Card></ScrollView>;
}
