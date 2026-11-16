import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { resendConfirmation } from '../../api/auth';
import { ApiError } from '../../api/client';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';

export default function CheckEmail() {
  const t = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function resend() {
    if (!email) return;
    setLoading(true); setError(null);
    try {
      await resendConfirmation(email);
      setSent(true);
    } catch (e) { setError(e as ApiError); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell title="Vérifiez votre e-mail" subtitle="Une dernière étape pour activer votre compte."
      footer={<Button label="Aller à la connexion" variant="ghost" onPress={() => router.replace('/login')} />}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: t.soft }}>
          <Ionicons name="mail-unread-outline" size={40} color={t.brand} />
        </View>
        <AppText style={{ textAlign: 'center' }}>
          Nous avons envoyé un lien de confirmation{email ? ` à ${email}` : ''}. Ouvrez-le pour activer votre compte, puis connectez-vous.
        </AppText>
        <AppText variant="caption" muted style={{ textAlign: 'center' }}>
          Pensez à vérifier les indésirables. Le lien expire au bout d’un certain temps.
        </AppText>
      </View>
      {sent && <AppText color={t.brand} style={{ textAlign: 'center', fontWeight: '700' }}>Nouvel e-mail envoyé.</AppText>}
      {error && <ErrorBox message={error.title} />}
      {email ? <Button label="Renvoyer l’e-mail" icon="refresh" variant="secondary" loading={loading} onPress={resend} /> : null}
      <Pressable accessibilityRole="link" onPress={() => router.replace('/login')} style={{ alignItems: 'center', padding: 6 }}>
        <AppText color={t.brand}>J’ai confirmé, je me connecte</AppText>
      </Pressable>
    </AuthShell>
  );
}
