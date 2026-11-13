import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { login, registerRecruiter, registerWorker } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';
import { useSession } from '../../auth/session';
import { COUNTRY_PREFIX } from '../../config';
import { emailOk } from '../../lib/validation';
import { useTheme } from '../../theme/useTheme';
import { AppText } from '../../ui/AppText';
import { AuthShell } from '../../ui/AuthShell';
import { Button } from '../../ui/Button';
import { ChoiceCard } from '../../ui/ChoiceCard';
import { ErrorBox } from '../../ui/ErrorBox';
import { Segmented } from '../../ui/Segmented';
import { TextField } from '../../ui/TextField';
import { useRouter } from 'expo-router';

type Role = 'TRAVAILLEUR' | 'RECRUTEUR';
const fmt = (d: string) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');

export default function Register() {
  const t = useTheme();
  const router = useRouter();
  const { signIn } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [nom, setNom] = useState('');
  const [digits, setDigits] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [type, setType] = useState<'PARTICULIER' | 'ENTREPRISE'>('PARTICULIER');
  const [raison, setRaison] = useState('');
  const [fe, setFe] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    const e: Record<string, string> = {};
    if (nom.trim().length < 2) e.nom = 'Indiquez votre nom.';
    if (digits.length !== 9) e.telephone = 'Entrez les 9 chiffres, par exemple 77 123 45 67.';
    if (!emailOk(email)) e.email = 'Entrez une adresse e-mail valide.';
    if (password.length < 8) e.password = '8 caractères au moins.';
    if (role === 'TRAVAILLEUR' && confirmationPassword !== password) e.confirmationPassword = 'Les mots de passe doivent correspondre.';
    if (role === 'RECRUTEUR' && type === 'ENTREPRISE' && raison.trim().length < 2) e.raisonSociale = 'Indiquez le nom de l’entreprise.';
    setFe(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const base = { email: email.trim().toLowerCase(), password, nom: nom.trim(), telephone: `${COUNTRY_PREFIX}${digits}` };
    try {
      if (role === 'TRAVAILLEUR') {
        await registerWorker({ ...base, confirmationPassword, langue: 'fr' });
      } else {
        await registerRecruiter({ ...base, typeRecruteur: type, raisonSociale: type === 'ENTREPRISE' ? raison.trim() : nom.trim() });
      }
    } catch (err) { setError(err as ApiError); setFe(fieldErrors(err)); setLoading(false); return; }
    try {
      const res = await login(email, password);
      if (res.user && res.user.role !== role) {
        Alert.alert('Rôle inattendu',
          `Vous avez créé un compte ${role === 'TRAVAILLEUR' ? 'travailleur' : 'recruteur'}, mais le serveur répond « ${res.user.role} ». ` +
          'Avec le serveur de simulation, lancez le mock du bon rôle (port 4011 pour le travailleur) ; avec le vrai serveur, signalez-le à Ibrahima.');
      }
      await signIn(res); // la redirection vers l'espace du rôle se fait dans (app)/index
    } catch { setLoading(false); router.replace('/login'); } // compte créé : on invite à se connecter
  }

  if (!role) {
    return (
      <AuthShell title="Créer un compte" subtitle="Vous êtes…">
        <ChoiceCard icon="hammer-outline" title="Je cherche du travail" subtitle="Travailleur" selected={false} onPress={() => setRole('TRAVAILLEUR')} />
        <ChoiceCard icon="briefcase-outline" title="Je cherche des travailleurs" subtitle="Recruteur" selected={false} onPress={() => setRole('RECRUTEUR')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title={role === 'TRAVAILLEUR' ? 'Compte travailleur' : 'Compte recruteur'}
      subtitle="Quelques informations pour commencer."
      footer={<Button label="Changer de profil" variant="ghost" onPress={() => setRole(null)} />}>
      <TextField label="Votre nom" icon="person-outline" autoCapitalize="words" value={nom} onChangeText={setNom} error={fe.nom} />
      <TextField label="Numéro de téléphone" icon="call-outline" prefix="🇸🇳 +221" keyboardType="number-pad" placeholder="77 123 45 67"
        value={fmt(digits)} onChangeText={(v) => { let d = v.replace(/\D/g, ''); if (d.startsWith('221') && d.length > 9) d = d.slice(3); setDigits(d.slice(0, 9)); }} error={fe.telephone} />
      <TextField label="Adresse e-mail" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        value={email} onChangeText={setEmail} error={fe.email} />
      <TextField label="Mot de passe" icon="lock-closed-outline" secureTextEntry={!show} autoCapitalize="none" hint="8 caractères au moins"
        value={password} onChangeText={setPassword} error={fe.password}
        right={<Pressable accessibilityRole="button" accessibilityLabel={show ? 'Masquer' : 'Afficher'} onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      {role === 'TRAVAILLEUR' && (
        <TextField label="Confirmer le mot de passe" icon="lock-closed-outline" secureTextEntry={!showConfirmation} autoCapitalize="none"
          value={confirmationPassword} onChangeText={setConfirmationPassword} error={fe.confirmationPassword}
          right={<Pressable accessibilityRole="button" accessibilityLabel={showConfirmation ? 'Masquer' : 'Afficher'} onPress={() => setShowConfirmation(!showConfirmation)}><Ionicons name={showConfirmation ? 'eye-off-outline' : 'eye-outline'} size={22} color={t.muted} /></Pressable>} />
      )}

      {role === 'RECRUTEUR' && (
        <>
          <Segmented value={type} onChange={setType} options={[{ value: 'PARTICULIER', label: 'Particulier' }, { value: 'ENTREPRISE', label: 'Entreprise' }]} />
          {type === 'ENTREPRISE' && <TextField label="Nom de l’entreprise" icon="business-outline" value={raison} onChangeText={setRaison} error={fe.raisonSociale} />}
        </>
      )}

      {error && <ErrorBox message={error.title} code={error.code} />}
      <Button label="Créer mon compte" icon="checkmark" large loading={loading} onPress={submit} />
    </AuthShell>
  );
}
