import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { resetPassword } from '../../api/auth';
import { ApiError } from '../../api/client';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

type ResetParams = { token?: string; token_hash?: string; access_token?: string; type?: string };

/** Supabase envoie soit `?token_hash=…`, soit un fragment `#access_token=…&type=recovery`. */
function extractToken(params: ResetParams, fragment: string): string | null {
  if (params.token) return params.token;
  if (params.token_hash) return params.token_hash;
  if (params.access_token) return params.access_token;
  const hash = fragment.startsWith('#') ? fragment.slice(1) : fragment;
  if (!hash) return null;
  const search = new URLSearchParams(hash);
  return search.get('access_token') ?? search.get('token_hash') ?? search.get('token');
}

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<ResetParams>();
  const fragment = typeof window !== 'undefined' && window.location ? window.location.hash : '';
  const linkToken = useMemo(() => extractToken(params, fragment), [params.token, params.token_hash, params.access_token, fragment]);
  const [token, setToken] = useState(linkToken ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!token || password.length < 8 || password !== confirmation) {
      setError(new ApiError(400, 'FORMULAIRE', 'Vérifiez le lien et saisissez deux mots de passe identiques (8 caractères minimum).'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token.trim(), password, confirmation);
      router.replace('/login');
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
      {linkToken ? (
        <AppText muted>Lien de récupération reconnu. Il ne vous reste qu'à choisir un nouveau mot de passe.</AppText>
      ) : (
        <TextField label="Jeton de récupération" icon="key-outline" value={token} onChangeText={setToken} autoCapitalize="none" />
      )}
      <TextField label="Nouveau mot de passe" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} hint="8 caractères au moins" />
      <TextField label="Confirmer le mot de passe" icon="lock-closed-outline" secureTextEntry value={confirmation} onChangeText={setConfirmation} />
      {error ? <ErrorBox message={error.title} code={error.code} /> : null}
      <Button label="Réinitialiser" icon="checkmark" loading={loading} onPress={submit} />
      {!linkToken ? <AppText muted>Le jeton est fourni par le lien reçu par e-mail.</AppText> : null}
    </AuthShell>
  );
}
