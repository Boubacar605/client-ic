import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAgentProfile, useAgentProfileMutation } from '../../../api/hooks';
import { useSession } from '../../../auth/session';
import { useTheme } from '../../../theme/useTheme';
import { AppText } from '../../../ui/AppText';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';
import { ProfilePhotoCard } from '../../../ui/ProfilePhotoCard';

export default function AgentProfile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useSession();
  const q = useAgentProfile();
  const mutation = useAgentProfileMutation();
  const [perimetre, setPerimetre] = useState('');
  useEffect(() => { if (q.data) setPerimetre(q.data.perimetre ?? ''); }, [q.data]);

  const code = q.data?.codeParrainage ?? '';
  const inviteLink = code ? Linking.createURL('/register', { queryParams: { role: 'TRAVAILLEUR', code } }) : '';
  const partager = () => {
    if (!code) return;
    void Share.share({
      message: `Rejoignez Xeuysil et trouvez du travail près de chez vous. À l’inscription, choisissez « Je cherche du travail » et saisissez mon code agent ${code}.${inviteLink ? `\n${inviteLink}` : ''}`,
    });
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }}
      contentContainerStyle={[s.body, { paddingTop: insets.top + 16 }]}>
      <AppText variant="display">Profil agent</AppText>
      {q.data ? <ProfilePhotoCard photoUrl={q.data.photoUrl} queryKeys={[['agent-profile'], ['bootstrap']]} /> : null}
      {q.data?.codeParrainage ? (
        <Card>
          <View style={s.row}><Ionicons name="key-outline" size={22} color={t.brand} /><AppText variant="heading">Votre code de parrainage</AppText></View>
          <AppText variant="display" color={t.brand}>{q.data.codeParrainage}</AppText>
          <AppText muted>Transmettez ce code aux travailleurs que vous accompagnez : ils le saisissent au moment de leur inscription pour rejoindre votre portefeuille.</AppText>
          <Button label="Partager mon code" icon="share-social-outline" onPress={partager} />
          {inviteLink ? <AppText variant="caption" muted selectable>{inviteLink}</AppText> : null}
        </Card>
      ) : null}
      <Card>
        {q.data ? (
          <>
            <AppText variant="heading">{q.data.nom}</AppText>
            <AppText muted>{q.data.telephone ?? 'Téléphone non renseigné'} · {q.data.workersManaged} travailleurs</AppText>
            <TextField label="Périmètre" placeholder="Ex. Dakar — Médina" value={perimetre} onChangeText={setPerimetre} multiline hint="Zone de couverture de l’agent" />
            {mutation.error ? <ErrorBox message="Impossible d’enregistrer le profil." /> : null}
            <Button label="Enregistrer" loading={mutation.isPending} onPress={() => mutation.mutate({ perimetre })} />
          </>
        ) : <AppText muted>Chargement…</AppText>}
      </Card>
      <Button label="Se déconnecter" icon="log-out-outline" large onPress={signOut} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, paddingBottom: 140, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
