import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { resetPassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!token || password.length < 8 || password !== confirmation) { setError(new ApiError(400, 'FORMULAIRE', 'Vérifiez le lien et saisissez deux mots de passe identiques (8 caractères minimum).')); return; }
    setError(null); setLoading(true);
    try { await resetPassword(token, password, confirmation); router.replace('/login'); } catch (e) { setError(e as ApiError); } finally { setLoading(false); }
  }
  return <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
    <TextField label="Jeton de récupération" icon="key-outline" value={token} onChangeText={setToken} autoCapitalize="none" />
    <TextField label="Nouveau mot de passe" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
    <TextField label="Confirmer le mot de passe" icon="lock-closed-outline" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
    {error ? <ErrorBox message={error.title} code={error.code} /> : null}
    <Button label="Réinitialiser" icon="checkmark" loading={loading} onPress={submit} />
    <AppText muted>Le jeton est fourni par le lien reçu par e-mail.</AppText>
  </AuthShell>;
}
