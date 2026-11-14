import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { login } from '../../../api/auth';
import { ApiError, fieldErrors } from '../../../api/client';
import { useSession } from '../../../auth/session';
import { ADMIN_ROUTE_SECRET } from '../../../config';
import { emailOk } from '../../../lib/validation';
import { AppText } from '../../../ui/AppText';
import { AuthShell } from '../../../ui/AuthShell';
import { Button } from '../../../ui/Button';
import { ErrorBox } from '../../../ui/ErrorBox';
import { TextField } from '../../../ui/TextField';

export default function AdminLogin() {
  const { secret } = useLocalSearchParams<{ secret?: string }>();
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const invalidRoute = !ADMIN_ROUTE_SECRET || secret !== ADMIN_ROUTE_SECRET;
  async function submit() {
    if (!emailOk(email) || !password) { setError(new ApiError(400, 'FORMULAIRE', 'Saisissez un e-mail et un mot de passe valides.')); return; }
    setError(null); setLoading(true);
    try {
      const result = await login(email, password);
      if (result.user?.role && result.user.role !== 'ADMINISTRATEUR') throw new ApiError(403, 'ROLE_REFUSE', 'Ce compte ne dispose pas des droits administrateur.');
      await signIn(result);
      router.replace('/admin');
    } catch (e) {
      setError(e as ApiError);
      fieldErrors(e);
    } finally { setLoading(false); }
  }
  if (invalidRoute) return <AuthShell title="Page introuvable" subtitle="Cette adresse n'est pas disponible."><AppText>Accès refusé.</AppText></AuthShell>;
  return <AuthShell title="Accès administration" subtitle="Connexion réservée aux comptes créés en back-office.">
    <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
    <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
    {error ? <ErrorBox message={error.title} code={error.code} /> : null}
    <Button label="Ouvrir le back-office" icon="shield-checkmark-outline" loading={loading} onPress={submit} />
  </AuthShell>;
}
