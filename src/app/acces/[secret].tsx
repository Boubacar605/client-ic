import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { login } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { useSession } from '../../auth/session';
import { ADMIN_ROUTE_SECRET } from '../../config';
import { emailOk } from '../../lib/validation';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ErrorBox } from '../../ui/ErrorBox';
import { TextField } from '../../ui/TextField';

// Rend la route disponible aussi en export statique (web) : /acces/<secret> est pré-généré.
export async function generateStaticParams() {
  const secret = (process.env.EXPO_PUBLIC_ADMIN_ROUTE ?? '').replace(/^\/+|\/+$/g, '');
  return [{ secret: secret || 'indisponible' }];
}

/**
 * Connexion administrateur dédiée. Cette route vit hors des groupes (auth)/(app)
 * pour qu'aucune redirection de session ne puisse renvoyer vers la connexion classique.
 */
export default function AdminLogin() {
  const { secret } = useLocalSearchParams<{ secret?: string }>();
  const router = useRouter();
  const { signIn, signOut } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const invalidRoute = !ADMIN_ROUTE_SECRET || secret !== ADMIN_ROUTE_SECRET;

  async function submit() {
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = 'Entrez une adresse e-mail valide.';
    if (!password) e.password = 'Entrez votre mot de passe.';
    setFe(e);
    if (Object.keys(e).length) return;

    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.user?.role && result.user.role !== 'ADMINISTRATEUR') {
        throw new ApiError(403, 'ROLE_REFUSE', 'Ce compte ne dispose pas des droits administrateur.');
      }
      const profil = await signIn(result);
      if (profil.role !== 'ADMINISTRATEUR') {
        await signOut();
        throw new ApiError(403, 'ROLE_REFUSE', 'Ce compte ne dispose pas des droits administrateur.');
      }
      router.replace('/admin');
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'ERREUR', 'Impossible de vous connecter. Réessayez dans un instant.'));
      setFe(fieldErrors(e));
    } finally {
      setLoading(false);
    }
  }

  if (invalidRoute) {
    return (
      <AuthShell title="Page introuvable" subtitle="Cette adresse n’est pas disponible.">
        <AppText muted>Vérifiez le lien utilisé pour accéder à l’administration.</AppText>
        <Button label="Revenir à l’accueil" icon="arrow-back" variant="secondary" onPress={() => router.replace('/welcome')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Accès administration" subtitle="Connexion réservée aux comptes administrateur.">
      <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        placeholder="nom@exemple.com" value={email} onChangeText={setEmail} error={fe.email} />
      <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry autoCapitalize="none"
        placeholder="Votre mot de passe" value={password} onChangeText={setPassword} error={fe.password} />
      {error ? <ErrorBox message={error.title} /> : null}
      <Button label="Ouvrir le back-office" icon="shield-checkmark-outline" loading={loading} onPress={submit} />
    </AuthShell>
  );
}
