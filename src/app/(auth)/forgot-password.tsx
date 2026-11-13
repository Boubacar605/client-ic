import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { forgotPassword } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { emailOk } from '../../lib/validation';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit() {
    if (!emailOk(email)) { setFieldError('Entrez une adresse e-mail valide.'); return; }
    setFieldError(''); setError(null); setLoading(true);
    try { await forgotPassword(email); setSent(true); } catch (e) { setError(e as ApiError); setFieldError(fieldErrors(e).email ?? ''); } finally { setLoading(false); }
  }
  return <AuthShell title="Mot de passe oublié ?" subtitle="Nous vous enverrons un lien de récupération sécurisé.">
    {sent ? <><AppText>Si un compte correspond à cette adresse, un e-mail de récupération a été envoyé.</AppText><Button label="Retour à la connexion" icon="arrow-back" onPress={() => router.replace('/login')} /></> :
      <><TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} error={fieldError} />
        {error ? <ErrorBox message={error.title} code={error.code} /> : null}<Button label="Envoyer le lien" icon="mail-outline" loading={loading} onPress={submit} /></>}
  </AuthShell>;
}
