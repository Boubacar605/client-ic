import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { login } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { useSession } from '../../auth/session';
import { getBaseUrl } from '../../config';
import { emailOk } from '../../lib/validation';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});

  async function submit() {
    setError(null);
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = 'Entrez une adresse e-mail valide.';
    if (!password) e.password = 'Entrez votre mot de passe.';
    setFe(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await signIn(await login(email, password)); }
    catch (err) { setError(err as ApiError); setFe(fieldErrors(err)); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell title="Bon retour !" subtitle="Connectez-vous pour retrouver vos missions."
      footer={
        <>
          <Button label="Créer un compte" variant="secondary" icon="person-add-outline" large onPress={() => router.push('/register')} />
          <Pressable onPress={() => router.push('/debug')} accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
            <AppText variant="caption" muted>Serveur : {getBaseUrl().replace(/^https?:\/\//, '') || 'non défini'}</AppText>
          </Pressable>
        </>
      }>
      <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        placeholder="nom@exemple.com" value={email} onChangeText={setEmail} error={fe.email} />
      <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry={!show} autoCapitalize="none" value={password} onChangeText={setPassword}
        error={fe.password} right={<Pressable accessibilityRole="button" accessibilityLabel={show ? 'Masquer' : 'Afficher'} onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      <Pressable onPress={() => router.push('/forgot-password')} accessibilityRole="link" style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
        <AppText color={t.brand}>Mot de passe oublié ?</AppText>
      </Pressable>
      {error && <ErrorBox message={error.title} code={error.code} />}
      <Button label="Se connecter" icon="arrow-forward" large loading={loading} onPress={submit} />
    </AuthShell>
  );
}
